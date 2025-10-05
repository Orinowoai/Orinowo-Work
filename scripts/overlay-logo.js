/*
  Overlay Orinowo logo onto merch mockups.

  Inputs:
    - Logo: public/brand/logo-full.png
    - Source images: public/merch/mockups/*.jpg|*.jpeg|*.png
  Output:
    - public/merch/final/<same-name>

  Usage:
    npm run overlay:logo
*/

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = process.cwd()
const DEFAULT_LOGO_PATH = path.join(ROOT, 'public', 'brand', 'logo-full.png')
const SRC_DIR = path.join(ROOT, 'public', 'merch', 'mockups')
const OUT_DIR = path.join(ROOT, 'public', 'merch', 'final')
const CONFIG_PATH = path.join(ROOT, 'scripts', 'overlay.config.json')

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
      const cfg = JSON.parse(raw)
      return cfg
    }
  } catch (e) {
    console.warn('Warning: failed to read config:', e.message)
  }
  return { global: {}, types: {}, overrides: [] }
}

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true })
}

function detectItemType(p) {
  const s = p.toLowerCase()
  if (/(hoodie|sweatshirt|jumper)/.test(s)) return 'hoodie'
  if (/(tshirt|tee|shirt)/.test(s)) return 'tshirt'
  if (/(cap|hat|beanie)/.test(s)) return 'cap'
  if (/(tote|bag)/.test(s)) return 'tote'
  if (/(mug|cup)/.test(s)) return 'mug'
  if (/(phone|case)/.test(s)) return 'phonecase'
  if (/(vinyl|record|lp|sleeve)/.test(s)) return 'vinyl'
  return 'generic'
}

function defaultItemRules(type) {
  switch (type) {
    case 'hoodie':
    case 'tshirt':
      return { scale: 0.18, offsetY: -0.12, offsetX: 0 }
    case 'cap':
      return { scale: 0.26, offsetY: -0.18, offsetX: 0 }
    case 'tote':
      return { scale: 0.30, offsetY: 0.02, offsetX: 0 }
    case 'mug':
      return { scale: 0.24, offsetY: 0, offsetX: 0 }
    case 'phonecase':
      return { scale: 0.28, offsetY: 0, offsetX: 0 }
    case 'vinyl':
      return { scale: 0.40, offsetY: 0, offsetX: 0 }
    default:
      return { scale: 0.22, offsetY: 0, offsetX: 0 }
  }
}

function matchOverride(overrides, filePath) {
  const base = path.basename(filePath)
  for (const o of overrides || []) {
    if (o.file && o.file.toLowerCase() === base.toLowerCase()) return o
    if (o.pattern) {
      try {
        const re = new RegExp(o.pattern, 'i')
        if (re.test(filePath)) return o
      } catch (_) { /* ignore bad regex */ }
    }
  }
  return null
}

function mergedRulesForFile(cfg, itemType, filePath) {
  const base = defaultItemRules(itemType)
  const typeOverrides = (cfg.types && cfg.types[itemType]) || {}
  const o = matchOverride(cfg.overrides, filePath) || {}
  return { ...base, ...typeOverrides, ...o }
}

async function overlayOne(mockupPath, cfg) {
  const itemType = detectItemType(mockupPath)
  const rules = mergedRulesForFile(cfg, itemType, mockupPath)
  const img = sharp(mockupPath)
  const meta = await img.metadata()
  const width = meta.width || 2000
  const height = meta.height || Math.round(width * 0.75)

  // Logo sizing rule depends on item type (scale is portion of image width)
  const logoTargetWidth = Math.max(32, Math.round(width * (rules.scale || 0.22)))
  const logoPath = (rules.logo && path.isAbsolute(rules.logo))
    ? rules.logo
    : path.join(ROOT, rules.logo || (cfg.global && cfg.global.logo) || DEFAULT_LOGO_PATH)
  const absLogoPath = path.isAbsolute(logoPath) ? logoPath : path.normalize(logoPath)

  const logoBufBase = await sharp(absLogoPath)
    .resize({ width: logoTargetWidth })
    .toBuffer()

  const logoMeta = await sharp(logoBufBase).metadata()
  const lw = logoMeta.width || logoTargetWidth
  const lh = logoMeta.height || Math.round(logoTargetWidth * 0.4)

  // Compute centered position plus offsets
  let left = typeof rules.left === 'number' ? Math.round(rules.left) : Math.round((width - lw) / 2)
  let top = typeof rules.top === 'number' ? Math.round(rules.top) : Math.round((height - lh) / 2)
  if (typeof rules.left !== 'number') left += Math.round(width * (rules.offsetX || 0))
  if (typeof rules.top !== 'number') top += Math.round(height * (rules.offsetY || 0))

  // Clamp to bounds
  left = Math.max(0, Math.min(left, Math.max(0, width - lw)))
  top = Math.max(0, Math.min(top, Math.max(0, height - lh)))

  const overlayOptions = { input: logoBufBase, left, top }
  if (typeof rules.opacity === 'number') overlayOptions.opacity = Math.max(0, Math.min(1, rules.opacity))

  const composite = await img
    .composite([overlayOptions])
    .toBuffer()

  const rel = path.relative(SRC_DIR, mockupPath)
  const outPath = path.join(OUT_DIR, rel)
  await ensureDir(path.dirname(outPath))
  await sharp(composite).toFile(outPath)
  return { outPath, itemType, left, top, logoWidth: lw }
}

async function listImagesRecursive(dir) {
  const out = []
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      out.push(...await listImagesRecursive(full))
    } else if (/\.(jpg|jpeg|png)$/i.test(e.name)) {
      out.push(full)
    }
  }
  return out
}

async function run() {
  const cfg = loadConfig()
  const logoToCheck = (cfg.global && cfg.global.logo) ? cfg.global.logo : DEFAULT_LOGO_PATH
  const absLogo = path.isAbsolute(logoToCheck) ? logoToCheck : path.join(ROOT, logoToCheck)
  if (!fs.existsSync(absLogo)) {
    console.error('Logo not found at', absLogo)
    process.exit(1)
  }
  if (!fs.existsSync(SRC_DIR)) {
    console.error('Source directory not found:', SRC_DIR)
    process.exit(1)
  }
  await ensureDir(OUT_DIR)

  const files = await listImagesRecursive(SRC_DIR)

  if (files.length === 0) {
    console.warn('No mockup images found in', SRC_DIR)
    return
  }

  console.log(`Processing ${files.length} image(s)...`)
  let ok = 0
  for (const f of files) {
    try {
      const { outPath, itemType, left, top, logoWidth } = await overlayOne(f, loadConfig())
      console.log(`✔ ${path.basename(f)} [${itemType}] @(${left},${top}) w=${logoWidth} → ${path.relative(ROOT, outPath)}`)
      ok++
    } catch (e) {
      console.error('✖ Failed', f, e.message)
    }
  }
  console.log(`Done. ${ok}/${files.length} images processed.`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
