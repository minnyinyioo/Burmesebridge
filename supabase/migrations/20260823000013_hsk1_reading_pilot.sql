alter table public.knowledge_course_sections add column if not exists catalog_key text;
alter table public.knowledge_lessons add column if not exists catalog_key text;
create unique index if not exists knowledge_sections_catalog_key_unique on public.knowledge_course_sections(catalog_key) where catalog_key is not null;
create unique index if not exists knowledge_lessons_catalog_key_unique on public.knowledge_lessons(catalog_key) where catalog_key is not null;

do $$
declare product bigint; section_basics bigint; section_daily bigint; section_time bigint; lesson bigint;
begin
  select id into product from public.knowledge_products where catalog_key='hsk-1-reading';
  if product is null then raise exception 'HSK 1 reading draft course is missing'; end if;

  insert into public.knowledge_resource_licenses(product_id,resource_type,title,source_url,author_name,license_code,license_url,attribution_text,verified_at)
  select product,'dataset','HSK Cards HSK 1 vocabulary dataset','https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv','Ted Nyman','MIT','https://github.com/tnm/hsk/blob/main/LICENSE','HSK vocabulary adapted from HSK Cards by Ted Nyman, licensed under the MIT License.',now()
  where not exists(select 1 from public.knowledge_resource_licenses where product_id=product and source_url='https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv');

  insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status)
  values(product,'hsk-1-reading-basics','第一章：汉字、拼音与基础词汇','အခန်း ၁ — တရုတ်စာလုံး၊ Pinyin နှင့် အခြေခံဝေါဟာရ','Section 1 — Characters, pinyin and core words',0,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set title_zh=excluded.title_zh returning id into section_basics;
  insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status)
  values(product,'hsk-1-reading-daily','第二章：日常人物与事物','အခန်း ၂ — နေ့စဉ် လူပုဂ္ဂိုလ်နှင့် အရာဝတ္ထုများ','Section 2 — Everyday people and things',1,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set title_zh=excluded.title_zh returning id into section_daily;
  insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status)
  values(product,'hsk-1-reading-time','第三章：数字、时间与地点','အခန်း ၃ — ကိန်းဂဏန်း၊ အချိန်နှင့် နေရာ','Section 3 — Numbers, time and places',2,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set title_zh=excluded.title_zh returning id into section_time;

  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_basics,'hsk-1-reading-lesson-1','第 1 课：认识汉字和拼音','သင်ခန်းစာ ၁ — တရုတ်စာလုံးနှင့် Pinyin ကို သိရှိခြင်း','Lesson 1 — Meet characters and pinyin',0,true,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set section_id=excluded.section_id returning id into lesson;
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson,'本课学习最基础的 HSK 1 汉字、拼音和词义。先准确识读，再放入短句中理解。','ဤသင်ခန်းစာတွင် HSK 1 အခြေခံ တရုတ်စာလုံး၊ Pinyin နှင့် အဓိပ္ပာယ်တို့ကို လေ့လာပါမည်။ ဦးစွာ မှန်ကန်စွာ ဖတ်ရှုပြီးနောက် ဝါကျတိုများအတွင်း နားလည်အသုံးပြုပါ။','Learn foundational HSK 1 characters, pinyin and meanings. Read each item accurately before using it in short sentences.',
  '["爱 · ài · ချစ်သည် · to love","八 · bā · ရှစ် · eight","爸爸 · bà ba · ဖခင် · father","杯子 · bēi zi · ခွက် · cup","北京 · Běi jīng · ပေကျင်း · Beijing","本 · běn · စာအုပ်ရေတွက်ပုဒ် · measure word for books","不客气 · bù kè qi · အားမနာပါနှင့် · you are welcome","不 · bù · မ…/မဟုတ် · not","菜 · cài · ဟင်းလျာ · dish","茶 · chá · လက်ဖက်ရည် · tea"]'::jsonb,
  '学习顺序：汉字 → 拼音 → 缅文/英文释义 → 朗读 → 造句。','လေ့လာမှုအစဉ် — တရုတ်စာလုံး → Pinyin → မြန်မာ/English အဓိပ္ပာယ် → အသံထွက်ဖတ်ခြင်း → ဝါကျဖွဲ့ခြင်း။','Study sequence: character → pinyin → Burmese/English meaning → read aloud → make a sentence.')
  on conflict(lesson_id) do update set vocabulary=excluded.vocabulary,body_my=excluded.body_my,body_zh=excluded.body_zh,body_en=excluded.body_en,handout_my=excluded.handout_my,handout_zh=excluded.handout_zh,handout_en=excluded.handout_en;

  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_daily,'hsk-1-reading-lesson-2','第 2 课：饮食与日常动作','သင်ခန်းစာ ၂ — အစားအသောက်နှင့် နေ့စဉ်လုပ်ဆောင်ချက်','Lesson 2 — Food and daily actions',1,false,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set section_id=excluded.section_id returning id into lesson;
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson,'通过饮食和日常动作词汇理解简单句子的基本结构。','အစားအသောက်နှင့် နေ့စဉ်လုပ်ဆောင်ချက်ဆိုင်ရာ ဝေါဟာရများမှတစ်ဆင့် ရိုးရှင်းသောဝါကျဖွဲ့စည်းပုံကို နားလည်ပါ။','Use food and everyday-action vocabulary to understand basic sentence patterns.',
  '["吃 · chī · စားသည် · to eat","喝 · hē · သောက်သည် · to drink","饭馆 · fàn guǎn · စားသောက်ဆိုင် · restaurant","菜 · cài · ဟင်းလျာ · dish","茶 · chá · လက်ဖက်ရည် · tea","东西 · dōng xi · ပစ္စည်း/အရာဝတ္ထု · thing","读 · dú · ဖတ်သည် · to read","工作 · gōng zuò · အလုပ်လုပ်သည် · to work","打电话 · dǎ diàn huà · ဖုန်းခေါ်သည် · make a phone call","看 · kàn · ကြည့်သည်/ဖတ်သည် · to look/read"]'::jsonb,
  '用“谁 + 做什么”识别句子主干，再补充时间、地点或宾语。','“ဘယ်သူ + ဘာလုပ်သည်” ပုံစံဖြင့် ဝါကျအဓိကဖွဲ့စည်းပုံကို ရှာပြီး အချိန်၊ နေရာ သို့မဟုတ် ကံပုဒ်ကို ဖြည့်ပါ။','Identify “who + does what”, then add time, place or an object.')
  on conflict(lesson_id) do update set vocabulary=excluded.vocabulary,body_my=excluded.body_my,body_zh=excluded.body_zh,body_en=excluded.body_en,handout_my=excluded.handout_my,handout_zh=excluded.handout_zh,handout_en=excluded.handout_en;

  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_time,'hsk-1-reading-lesson-3','第 3 课：数字与时间表达','သင်ခန်းစာ ၃ — ကိန်းဂဏန်းနှင့် အချိန်ဖော်ပြချက်','Lesson 3 — Numbers and time',2,false,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set section_id=excluded.section_id returning id into lesson;
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson,'学习识读数字、时间和数量问句，并从短句中提取关键信息。','ကိန်းဂဏန်း၊ အချိန်နှင့် အရေအတွက်မေးခွန်းများကို ဖတ်ရှုနားလည်ပြီး ဝါကျတိုမှ အဓိကအချက်အလက်ကို ရယူပါ။','Read numbers, time and quantity questions, then extract key information from short sentences.',
  '["二 · èr · နှစ် · two","八 · bā · ရှစ် · eight","点 · diǎn · နာရီ · o’clock","分钟 · fēn zhōng · မိနစ် · minute","多少 · duō shao · ဘယ်လောက် · how many/much","个 · gè · အထွေထွေရေတွက်ပုဒ် · general measure word","都 · dōu · အားလုံး · all","多 · duō · များသည် · many","大 · dà · ကြီးသည် · big","本 · běn · စာအုပ်ရေတွက်ပုဒ် · measure word for books"]'::jsonb,
  '阅读时间与数量时，先圈出数字，再判断后面的量词或时间单位。','အချိန်နှင့် အရေအတွက်ကို ဖတ်သည့်အခါ ကိန်းဂဏန်းကို ဦးစွာမှတ်သားပြီး နောက်ရှိ ရေတွက်ပုဒ် သို့မဟုတ် အချိန်ယူနစ်ကို ခွဲခြားပါ။','When reading time and quantities, identify the number first, then its measure word or time unit.')
  on conflict(lesson_id) do update set vocabulary=excluded.vocabulary,body_my=excluded.body_my,body_zh=excluded.body_zh,body_en=excluded.body_en,handout_my=excluded.handout_my,handout_zh=excluded.handout_zh,handout_en=excluded.handout_en;
end$$;
