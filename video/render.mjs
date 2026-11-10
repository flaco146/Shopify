#!/usr/bin/env node
// Monta los vídeos verticales (1080x1920) a partir de contenido/guiones.json:
// voz en off con Fish Audio, un clip por escena, subtítulos grandes y texto de gancho.
//
// Uso:
//   node video/render.mjs demo-01 dolor-02   # renderiza esos guiones
//   node video/render.mjs --todos            # renderiza los 15
//   node video/render.mjs --prompts          # escribe video/prompts-ia.md con los prompts de cada clip
//
// Variables de entorno:
//   FISH_API_KEY   clave de Fish Audio (obligatoria para la voz)
//   FISH_VOICE_ID  id de voz de Fish Audio (opcional; sin ella usa la voz por defecto)
//   FISH_MODEL     modelo de voz (opcional, por defecto "s1")

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUIONES = path.join(ROOT, 'contenido', 'guiones.json');
const CLIPS = path.join(ROOT, 'video', 'clips');
const MUSICA = path.join(ROOT, 'video', 'musica');
const CACHE = path.join(ROOT, 'video', 'cache');
const SALIDA = path.join(ROOT, 'video', 'salida');

const W = 1080, H = 1920, FPS = 30;
const PAUSA = 0.3; // segundos de aire al final de cada escena
const EXT_VIDEO = ['.mp4', '.mov', '.webm', '.mkv'];
const EXT_IMAGEN = ['.jpg', '.jpeg', '.png', '.webp'];

async function ffmpeg(args) {
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { maxBuffer: 1 << 26 });
}

async function duracion(fichero) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fichero]);
  return parseFloat(stdout.trim());
}

async function voz(texto, destino) {
  if (existsSync(destino)) return destino;
  const clave = process.env.FISH_API_KEY;
  if (!clave) throw new Error('Falta FISH_API_KEY. Crea una clave en https://fish.audio y expórtala: export FISH_API_KEY=...');
  const cuerpo = { text: texto, format: 'mp3' };
  if (process.env.FISH_VOICE_ID) cuerpo.reference_id = process.env.FISH_VOICE_ID;
  const res = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clave}`,
      'Content-Type': 'application/json',
      model: process.env.FISH_MODEL || 's1',
    },
    body: JSON.stringify(cuerpo),
  });
  if (!res.ok) throw new Error(`Fish Audio respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  await writeFile(destino, Buffer.from(await res.arrayBuffer()));
  return destino;
}

async function buscarClip(id, n) {
  const dir = path.join(CLIPS, id);
  if (!existsSync(dir)) return null;
  const ficheros = await readdir(dir);
  const f = ficheros.find((x) => path.parse(x).name === String(n) && [...EXT_VIDEO, ...EXT_IMAGEN].includes(path.extname(x).toLowerCase()));
  return f ? path.join(dir, f) : null;
}

// ---------- Subtítulos ASS ----------

function tiempoAss(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), seg = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${seg.toFixed(2).padStart(5, '0')}`;
}

function textoAss(t) {
  return t.replace(/[{}]/g, '').replace(/\\/g, '').replace(/\n/g, '\\N');
}

function trocear(frase, maxPalabras = 4) {
  const palabras = frase.split(/\s+/).filter(Boolean);
  const trozos = [];
  for (let i = 0; i < palabras.length; i += maxPalabras) trozos.push(palabras.slice(i, i + maxPalabras).join(' '));
  return trozos;
}

function construirAss(escenas) {
  const cabecera = `[Script Info]
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter,68,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,6,0,2,80,80,520,1
Style: Gancho,Inter,74,&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,-1,0,0,0,100,100,0,0,3,18,0,8,90,90,300,1
Style: Provisional,Inter,40,&H00B0B0B0,&H00B0B0B0,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,120,120,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const lineas = [];
  for (const e of escenas) {
    const fin = e.inicio + e.duracion;
    if (e.pantalla) lineas.push(`Dialogue: 1,${tiempoAss(e.inicio)},${tiempoAss(fin)},Gancho,,0,0,0,,${textoAss(e.pantalla)}`);
    if (!e.clip) lineas.push(`Dialogue: 0,${tiempoAss(e.inicio)},${tiempoAss(fin)},Provisional,,0,0,0,,CLIP PENDIENTE (escena ${e.n})\\N\\N${textoAss(e.clip_ia)}`);
    const trozos = trocear(e.voz);
    const total = trozos.reduce((a, t) => a + t.length, 0);
    let t = e.inicio;
    for (const trozo of trozos) {
      const d = (trozo.length / total) * e.duracionVoz;
      lineas.push(`Dialogue: 2,${tiempoAss(t)},${tiempoAss(t + d)},Sub,,0,0,0,,${textoAss(trozo)}`);
      t += d;
    }
  }
  return cabecera + lineas.join('\n') + '\n';
}

// ---------- Render ----------

async function renderEscena(e, dirTrabajo) {
  const out = path.join(dirTrabajo, `escena-${e.n}.mp4`);
  const d = e.duracion.toFixed(3);
  const encode = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2', '-t', d, out];
  const audio = ['-i', e.audio];
  const af = ['-af', 'apad'];
  const ext = e.clip ? path.extname(e.clip).toLowerCase() : null;

  if (!e.clip) {
    await ffmpeg(['-f', 'lavfi', '-i', `color=c=0x1f2937:s=${W}x${H}:r=${FPS}`, ...audio, '-map', '0:v', '-map', '1:a', ...af, ...encode]);
  } else if (EXT_VIDEO.includes(ext)) {
    const vf = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1`;
    await ffmpeg(['-stream_loop', '-1', '-i', e.clip, ...audio, '-map', '0:v', '-map', '1:a', '-vf', vf, ...af, ...encode]);
  } else {
    // Imagen fija: ligero movimiento lateral para que no parezca una foto.
    const vf = `scale=${Math.round(W * 1.12)}:${Math.round(H * 1.12)}:force_original_aspect_ratio=increase,crop=${W}:${H}:x='(iw-ow)*t/${d}':y='(ih-oh)/2',fps=${FPS},setsar=1`;
    await ffmpeg(['-loop', '1', '-i', e.clip, ...audio, '-map', '0:v', '-map', '1:a', '-vf', vf, ...af, ...encode]);
  }
  return out;
}

async function musicaDeFondo() {
  if (!existsSync(MUSICA)) return null;
  const f = (await readdir(MUSICA)).find((x) => ['.mp3', '.m4a', '.wav'].includes(path.extname(x).toLowerCase()));
  return f ? path.join(MUSICA, f) : null;
}

async function renderGuion(g) {
  const dirTrabajo = path.join(CACHE, g.id);
  await mkdir(dirTrabajo, { recursive: true });
  await mkdir(SALIDA, { recursive: true });

  const escenas = [];
  let inicio = 0;
  for (const [i, esc] of g.escenas.entries()) {
    const n = i + 1;
    const hash = createHash('sha1').update(`${process.env.FISH_VOICE_ID || ''}|${esc.voz}`).digest('hex').slice(0, 10);
    const audio = await voz(esc.voz, path.join(dirTrabajo, `voz-${n}-${hash}.mp3`));
    const duracionVoz = await duracion(audio);
    const e = { ...esc, n, audio, duracionVoz, duracion: duracionVoz + PAUSA, inicio, clip: await buscarClip(g.id, n) };
    escenas.push(e);
    inicio += e.duracion;
  }

  const partes = [];
  for (const e of escenas) partes.push(await renderEscena(e, dirTrabajo));
  const lista = path.join(dirTrabajo, 'lista.txt');
  await writeFile(lista, partes.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));
  const unido = path.join(dirTrabajo, 'unido.mp4');
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', unido]);

  const ass = path.join(dirTrabajo, 'subtitulos.ass');
  await writeFile(ass, construirAss(escenas));
  const salida = path.join(SALIDA, `${g.id}.mp4`);
  const filtroSubs = `ass='${ass.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'")}'`;
  const musica = await musicaDeFondo();
  if (musica) {
    await ffmpeg(['-i', unido, '-stream_loop', '-1', '-i', musica,
      '-filter_complex', `[0:v]${filtroSubs}[v];[1:a]volume=0.12[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0[a]`,
      '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', salida]);
  } else {
    await ffmpeg(['-i', unido, '-vf', filtroSubs, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', salida]);
  }

  const texto = `${g.caption}\n\n${g.hashtags.join(' ')}\n`;
  await writeFile(path.join(SALIDA, `${g.id}.txt`), texto);
  const pendientes = escenas.filter((e) => !e.clip).map((e) => e.n);
  return { id: g.id, salida, segundos: Number(inicio.toFixed(1)), pendientes };
}

async function escribirPrompts(guiones) {
  const md = ['# Prompts para generar los clips con IA', '',
    'Genera cada clip en vertical 9:16, de 4 a 8 segundos, y guárdalo con el nombre indicado. Después ejecuta `node video/render.mjs <id>`.', ''];
  for (const g of guiones) {
    md.push(`## ${g.id} — ${g.angulo}`, '');
    g.escenas.forEach((e, i) => md.push(`- \`video/clips/${g.id}/${i + 1}.mp4\` — ${e.clip_ia}`));
    md.push('');
  }
  const destino = path.join(ROOT, 'video', 'prompts-ia.md');
  await writeFile(destino, md.join('\n'));
  return destino;
}

async function main() {
  const args = process.argv.slice(2);
  const { guiones } = JSON.parse(await readFile(GUIONES, 'utf8'));
  if (args.includes('--prompts')) {
    console.log(`Escrito ${await escribirPrompts(guiones)}`);
    return;
  }
  const ids = args.includes('--todos') ? guiones.map((g) => g.id) : args.filter((a) => !a.startsWith('--'));
  if (!ids.length) {
    console.log('Uso: node video/render.mjs <id> [id...] | --todos | --prompts');
    console.log('Guiones:', guiones.map((g) => g.id).join(', '));
    process.exit(1);
  }
  for (const id of ids) {
    const g = guiones.find((x) => x.id === id);
    if (!g) { console.error(`No existe el guion "${id}"`); process.exitCode = 1; continue; }
    const r = await renderGuion(g);
    const aviso = r.pendientes.length ? ` — faltan clips de las escenas ${r.pendientes.join(', ')} (fondo provisional)` : '';
    console.log(`✔ ${r.id}: ${path.relative(ROOT, r.salida)} (${r.segundos} s)${aviso}`);
  }
}

main().catch((err) => { console.error(err.message || err); process.exit(1); });
