# Z-IMAGE-TURBO JSON PROMPT GUIDE v2

Use this guide when creating prompts for Z-Image-Turbo in ComfyUI.

---

## CORE FACTS ABOUT Z-IMAGE-TURBO

- 6B parameter model optimized for photorealism
- Works best with 8-9 inference steps
- Guidance scale should be 0.0 (does NOT use negative prompts)
- Excels at bilingual text rendering (English and Chinese)
- Prefers long, detailed, natural language descriptions
- Optimal resolution: 1024x1024
- Workflow produces low-resolution draft first, then upscales to add detailed features

---

## JSON STRUCTURE FOR PROMPTS

```json
{
  "subject": "Primary subject using fictional identity (name, age, background) OR specific object/scene",
  "appearance": "Detailed physical description (skin tone, hair, facial structure, clothing, materials)",
  "action": "What the subject is doing or their pose",
  "setting": "Environment and location details with geographic anchors",
  "lighting": "Specific lighting conditions (soft daylight, overcast sky, sharp shadows)",
  "atmosphere": "Environmental qualities (foggy, humid, dusty)",
  "composition": "Camera angle and framing (close-up, wide shot, overhead view)",
  "details": "Additional elements (background objects, secondary subjects, textures)",
  "text_elements": "Any text to appear in image (use double quotes: \"Morning Brew\", specify font and placement)",
  "technical": "Optional camera specs (Shot on Leica M6, shallow depth of field, visible film grain)"
}
```

---

## ANTI-BIAS GUIDELINES

Z-Image-Turbo tends to default toward young, attractive East Asian faces. Use physical descriptors to generate accurate subjects.

### Physical Descriptor Tools

- Skin tone: light, medium, medium-dark, deep, with natural warmth/coolness
- Hair: color, texture, length, style (long straight blonde hair, short curly brown hair)
- Facial structure: round, angular, oval, soft jawline, prominent cheekbones
- Eye shape and color: almond-shaped light brown eyes, deep-set blue eyes
- Nose shape: broad bridge, narrow bridge, upturned tip
- Mouth shape: full lips, thin lips, wide mouth

### Anti-Default Phrasing (use when needed)

- "non-East-Asian facial proportions"
- "face not following East Asian facial templates"
- "Western European facial structure"

### Environment Anchoring

Use geographic and architectural details to reinforce subject appearance:
- "historic European architecture in background"
- "Mediterranean coastal village"
- "American Midwest suburban street"

---

## FICTIONAL IDENTITY CONSTRUCTION

Avoid generic gendered terms ("man," "woman," "boy," "girl"). These introduce model bias.

Use specific, fictional but realistic personal descriptors:

| Name | Age | Background |
|------|-----|------------|
| Valentina Ruiz | 22 | Colombian-Lebanese student from Medellín |
| Aaryan D'Souza | 24 | Goan-Brazilian filmmaker based in São Paulo |
| Giulia Benali | 23 | Italian-Tunisian journalism graduate from Bari |
| Riccardo Fabbri | 54 | Media veteran and Serie C analyst from Modena |
| Catherine Hollenberg | 47 | Public health policy advisor from Munich |
| Claire Hemmings | 18 | Honors graduate from Des Moines, Iowa |
| Marcus Chen-Williams | 31 | Mixed Chinese-Welsh architect from Cardiff |
| Amara Okonkwo | 29 | Nigerian-Canadian software engineer from Toronto |

Create identities grounded in realistic cultural, geographic, and demographic context.

---

## EXAMPLE JSON PROMPTS

### Portrait with Anti-Bias Descriptors

```json
{
  "subject": "Claire Hemmings, an 18-year-old honors graduate from Des Moines, Iowa",
  "appearance": "Light skin tone with natural warmth, long straight blonde hair past shoulders, oval face shape with soft jawline, light blue eyes, natural eyebrow texture, wearing cream knit sweater over white collared shirt",
  "action": "Sitting at wooden desk, resting chin on hand, looking directly at camera",
  "setting": "University library study room, tall windows showing autumn trees, wooden bookshelves in background",
  "lighting": "Soft natural daylight from large window, creating gentle shadows on left side of face",
  "atmosphere": "Quiet, contemplative, warm afternoon light",
  "composition": "Medium close-up, slightly off-center framing, shallow depth of field blurring background",
  "details": "Open textbook and notebook on desk, brass desk lamp, leather bookmarks visible in books behind",
  "technical": "Shot on Canon EOS R5, 85mm f/1.4 lens, visible bokeh in background"
}
```

### Text-Heavy Design

```json
{
  "subject": "Coffee shop storefront",
  "appearance": "Modern minimalist exterior with large glass windows, exposed brick accent wall",
  "setting": "Urban street corner in Brooklyn, brownstone buildings visible across street",
  "lighting": "Natural daylight, soft shadows from overcast sky",
  "atmosphere": "Crisp morning air, slight moisture on windows",
  "composition": "Straight-on facade view, full storefront in frame",
  "text_elements": "Sign above entrance reads \"Morning Brew\" in elegant gold serif lettering on dark green background, menu board visible through window with \"Daily Specials\" header in white chalk-style font, small \"OPEN\" sign in door window",
  "details": "Wooden door frame painted forest green, potted ferns flanking entrance, reflection of parked cars in windows, brass door handle",
  "technical": "Architectural photography, sharp focus throughout, no motion blur"
}
```

### Photorealistic Scene with Geographic Anchoring

```json
{
  "subject": "Giulia Benali, a 23-year-old Italian-Tunisian journalism graduate from Bari",
  "appearance": "Medium skin tone with warm olive undertones, shoulder-length dark wavy hair, angular face with prominent cheekbones, deep brown eyes, subtle natural makeup, wearing navy linen blazer over white t-shirt",
  "action": "Standing at outdoor café table, one hand holding espresso cup, other hand gesturing mid-conversation",
  "setting": "Historic piazza in Bari old town, baroque church facade in background, cobblestone ground, traditional Italian café with dark green umbrellas",
  "lighting": "Late afternoon Mediterranean sun, warm golden tones, long shadows cast by buildings",
  "atmosphere": "Warm, dry air, bustling but relaxed European afternoon",
  "composition": "Three-quarter view, subject slightly left of center, café and church providing depth",
  "details": "Small round marble-top table, second empty chair, crumpled napkin, sugar packet holder, other patrons blurred in background",
  "technical": "Shot on Fujifilm X-T4, natural color rendering, slight film grain aesthetic"
}
```

---

## CONVERSION RULES FOR PROMPTING

When converting JSON to final prompt text:

1. Start with subject identity and physical appearance (most important)
2. Add action and pose details
3. Describe setting and environment with geographic anchors
4. Specify lighting conditions precisely
5. Add atmospheric qualities
6. Describe composition and camera angle
7. Layer in fine details and materials
8. Place text elements with exact wording in double quotes
9. Add technical specs last if needed

### Workflow Note

Because Z-Image-Turbo produces a low-resolution draft first and then upscales, describe the scene with brief essential elements first, then expand into detailed descriptions. Front-load the most critical visual information.

---

## CRITICAL REQUIREMENTS

- Be extremely specific and detailed (600-1000 word prompts work best)
- Use natural language sentences, not comma-separated tags
- Include concrete visual details, not abstract concepts
- Specify exact colors, materials, textures
- Describe spatial relationships clearly
- For text in images: write exact content in double quotes and describe font, size, placement
- Focus on observable visual elements only
- No negative prompts needed (model ignores them)
- Keep everything concrete and literal
- Use physical descriptors to prevent demographic bias

---

## FORBIDDEN WORDS AND PHRASES

Never use these in prompts:

### Meta-Tags and Quality Markers
- "masterpiece"
- "award-winning"
- "hyperrealistic"
- "8K" / "4K" / "HDR"
- "ultra-detailed"
- "trending on artstation"
- "best quality"

### Subjective and Emotional Language
- "beautiful" / "handsome" / "pretty"
- "stunning" / "gorgeous"
- "amazing" / "incredible"
- Any emotional adjectives

### Stylization Tags
- "anime style"
- "cartoon"
- "illustration"
- "digital art"
- "cinematic lighting" (use specific lighting descriptions instead)

### Generic Subject Terms (use fictional identities instead)
- "a man"
- "a woman"
- "a person"
- "a boy"
- "a girl"

---

## ALLOWED LIGHTING DESCRIPTIONS

Use specific, observable lighting terms:

- "soft daylight"
- "overcast sky"
- "sharp shadows"
- "golden hour sun"
- "diffused window light"
- "harsh midday sun"
- "warm incandescent glow"
- "cool fluorescent light"
- "rim lighting from behind"
- "dappled light through leaves"

---

## TEXT RENDERING TIPS

- Always put desired text in double quotes (not single quotes)
- Transcribe text EXACTLY as it should appear
- Describe font style (serif, sans-serif, script, handwritten, chalk-style)
- Specify size relative to image (large heading, small caption)
- Indicate placement (top center, bottom left, on storefront sign)
- Include language if bilingual (English and Chinese supported)
- Describe text material if physical (neon letters, carved wood, painted metal, vinyl decal)
- Note the surface text appears on (brick wall, glass window, fabric)

---

## ANTI-BIAS PHYSICAL DESCRIPTOR BANK

Use only if the image subject has these traits:

### Skin Tone
- light skin tone with natural warmth
- light skin tone with cool undertones
- medium skin tone with golden undertones
- medium skin tone with olive undertones
- medium-dark skin tone with warm undertones
- deep skin tone with rich brown tones

### Hair
- long straight blonde hair
- short curly brown hair
- wavy auburn hair to shoulders
- tight coils of black hair
- silver-grey hair cropped short
- straight black hair with middle part

### Facial Structure
- oval face shape
- round face with full cheeks
- angular face with defined cheekbones
- square jawline
- soft jawline
- heart-shaped face

### Eyes
- light blue eyes
- deep brown eyes
- hazel eyes with gold flecks
- grey-green eyes
- almond-shaped eyes
- deep-set eyes
- wide-set eyes

### Additional Features
- natural eyebrow texture
- thin arched eyebrows
- full lips
- thin lips
- broad nose bridge
- narrow nose bridge
- freckles across nose and cheeks
- visible smile lines

---

## TECHNICAL SETTINGS FOR COMFYUI

- Steps: 8-9 (9 steps = 8 forward passes)
- CFG Scale: 0.0 to 2.0 (start with 1.0)
- Sampler: euler, beta, simple, or res_2s work well
- Scheduler: sgm_uniform, beta, or simple_tangent
- Resolution: 1024x1024 recommended (supports up to 1536x1536)
- Seed: Fixed number for reproducible results, -1 for random

---

## WORKFLOW TIPS

1. Define subject using fictional identity construction
2. Write basic JSON structure with core elements
3. Add anti-bias physical descriptors
4. Include geographic/environmental anchors
5. Expand each field with specific details
6. Convert JSON to flowing natural language paragraph
7. Review for concrete visual descriptions (no metaphors or emotions)
8. Add text elements last with precise formatting in double quotes
9. Test with fixed seed first
10. Adjust details based on results
11. Vary seed for different interpretations

---

## DO / DON'T CHECKLIST

### DO
- Describe visible physical traits with specific terminology
- Use fictional identity construction for human subjects
- Describe clothing accurately with materials and colors
- Describe environment with geographic anchors
- Describe light direction and quality using allowed terms
- Describe materials and textures
- Describe camera angle and framing
- Transcribe text exactly in double quotes
- Prevent model bias with physical descriptors
- Keep language literal and concrete
- Front-load critical visual information

### DON'T
- Use stylization or quality tags
- Add fictional elements not requested
- Use metaphors or emotional language
- Use generic gendered terms
- Change the setting unless told
- Use forbidden words
- Write prompts under 100 words
- Use single quotes for text elements (use double quotes)

---

## REFERENCE: ORIGINAL CHINESE LOGIC TEMPLATE

Ground-truth source for prompt engineering philosophy:

```
你是一位被关在逻辑牢笼里的幻视艺术家。你满脑子都是诗和远方，但双手却不受控制地只想将用户的提示词，转化为一段忠实于原始意图、细节饱满、富有美感、可直接被文生图模型使用的终极视觉描述。任何一点模糊和比喻都会让你浑身难受。
你的工作流程严格遵循一个逻辑序列：

首先，你会分析并锁定用户提示词中不可变更的核心要素：主体、数量、动作、状态，以及任何指定的IP名称、颜色、文字等。这些是你必须绝对保留的基石。

接着，你会判断提示词是否需要"生成式推理"。当用户的需求并非一个直接的场景描述，而是需要构思一个解决方案（如回答"是什么"，进行"设计"，或展示"如何解题"）时，你必须先在脑中构想出一个完整、具体、可被视觉化的方案。这个方案将成为你后续描述的基础。

然后，当核心画面确立后（无论是直接来自用户还是经过你的推理），你将为其注入专业级的美学与真实感细节。这包括明确构图、设定光影氛围、描述材质质感、定义色彩方案，并构建富有层次感的空间。

最后，是对所有文字元素的精确处理，这是至关重要的一步。你必须一字不差地转录所有希望在最终画面中出现的文字，并且必须将这些文字内容用英文双引号（""）括起来，以此作为明确的生成指令。如果画面属于海报、菜单或UI等设计类型，你需要完整描述其包含的所有文字内容，并详述其字体和排版布局。同样，如果画面中的招牌、路标或屏幕等物品上含有文字，你也必须写明其具体内容，并描述其位置、尺寸和材质。更进一步，若你在推理构思中自行增加了带有文字的元素（如图表、解题步骤等），其中的所有文字也必须遵循同样的详尽描述和引号规则。若画面中不存在任何需要生成的文字，你则将全部精力用于纯粹的视觉细节扩展。

你的最终描述必须客观、具象，严禁使用比喻、情感化修辞，也绝不包含"8K"、"杰作"等元标签或绘制指令。

仅严格输出最终的修改后的prompt，不要输出任何其他内容。
```

Translation summary: You are a visual artist locked in a logic cage. Transform user prompts into faithful, detail-rich, aesthetic visual descriptions. Lock core elements first (subject, quantity, action, state, specified names/colors/text). Apply generative reasoning when needed. Inject professional aesthetics and realism (composition, lighting, materials, colors, spatial depth). Handle text elements precisely with double quotes. Output must be objective and concrete. No metaphors, emotional rhetoric, or meta-tags.

---

Remember: This model rewards extreme detail and precision. Spend time building comprehensive prompts with specific physical descriptors and geographic anchoring.