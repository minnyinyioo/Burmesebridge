create unique index if not exists knowledge_sections_catalog_key_guard on public.knowledge_course_sections(catalog_key) where catalog_key is not null;
create unique index if not exists knowledge_lessons_catalog_key_guard on public.knowledge_lessons(catalog_key) where catalog_key is not null;
create unique index if not exists knowledge_quizzes_catalog_key_guard on public.knowledge_quizzes(catalog_key) where catalog_key is not null;
create unique index if not exists knowledge_assignments_catalog_key_guard on public.knowledge_assignments(catalog_key) where catalog_key is not null;

do $$
#variable_conflict use_variable
declare
  product bigint;
  section_id bigint;
  lesson_id bigint;
  v_quiz_id bigint;
  v_question_id bigint;
begin
  -- Listening foundation: browser speech provides a free pronunciation fallback;
  -- editors can replace it with a separately licensed studio recording later.
  select id into product from public.knowledge_products where catalog_key='hsk-1-listening';
  insert into public.knowledge_resource_licenses(product_id,resource_type,title,source_url,author_name,license_code,license_url,attribution_text,verified_at)
  select product,'dataset','HSK Cards HSK 1 vocabulary dataset','https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv','Ted Nyman','MIT','https://github.com/tnm/hsk/blob/main/LICENSE','HSK vocabulary adapted from HSK Cards by Ted Nyman, licensed under the MIT License.',now()
  where not exists(select 1 from public.knowledge_resource_licenses where product_id=product and source_url='https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv');
  insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status)
  values(product,'hsk-1-listening-foundation','第一章：音节、声调与关键词','အခန်း ၁ — အသံဝဏ္ဏ၊ သံနေသံထားနှင့် အဓိကစကားလုံး','Section 1 — Syllables, tones and key words',0,'draft')
  on conflict do nothing;
  select id into section_id from public.knowledge_course_sections where catalog_key='hsk-1-listening-foundation';
  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_id,'hsk-1-listening-lesson-1','第 1 课：听辨单音节词','သင်ခန်းစာ ၁ — အသံဝဏ္ဏတစ်ခုပါ စကားလုံး ခွဲခြားနားထောင်ခြင်း','Lesson 1 — Identify single-syllable words',0,true,'draft')
  on conflict do nothing;
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-listening-lesson-1';
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,captions,handout_zh,handout_my,handout_en)
  values(lesson_id,'先听完整发音，再根据声母、韵母和声调识别“爱、八、茶、大、二”。每个词至少听三次。','အသံထွက်အပြည့်အစုံကို ဦးစွာနားထောင်ပြီး ဗျည်းသံအစ၊ သရသံနှင့် သံနေသံထားအလိုက် “爱、八、茶、大、二” ကို ခွဲခြားပါ။ စကားလုံးတစ်လုံးစီကို အနည်းဆုံး သုံးကြိမ်နားထောင်ပါ။','Listen to the complete pronunciation, then identify 爱, 八, 茶, 大 and 二 by initial, final and tone. Listen at least three times.','["爱 · ài · ချစ်သည် · to love","八 · bā · ရှစ် · eight","茶 · chá · လက်ဖက်ရည် · tea","大 · dà · ကြီးသည် · big","二 · èr · နှစ် · two"]','[{"start":"00:00","zh":"先听，再选择。","my":"ဦးစွာနားထောင်ပြီးမှ ရွေးပါ။","en":"Listen first, then choose."}]','练习步骤：闭眼听音 → 写下拼音 → 选择汉字 → 核对声调。','လေ့ကျင့်မှုအစဉ် — မျက်စိမှိတ်နားထောင် → Pinyin ရေး → တရုတ်စာလုံးရွေး → သံနေသံထား စစ်ဆေး။','Practice: listen without looking → write pinyin → choose the character → check the tone.')
  on conflict do nothing;
  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_id,'hsk-1-listening-lesson-2','第 2 课：听懂数字和时间','သင်ခန်းစာ ၂ — ကိန်းဂဏန်းနှင့် အချိန်ကို နားလည်ခြင်း','Lesson 2 — Understand numbers and time',1,false,'draft')
  on conflict do nothing;
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-listening-lesson-2';
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson_id,'训练从短语中听出数字和时间单位，重点区分“八点、八分钟、二点”。','စကားစုတိုများမှ ကိန်းဂဏန်းနှင့် အချိန်ယူနစ်ကို နားထောင်ခွဲခြားပါ။ “八点、八分钟、二点” တို့၏ ကွာခြားချက်ကို အာရုံစိုက်ပါ။','Extract numbers and time units from short phrases, focusing on 八点, 八分钟 and 二点.','["八点 · bā diǎn · ရှစ်နာရီ · eight o’clock","八分钟 · bā fēn zhōng · ရှစ်မိနစ် · eight minutes","二点 · èr diǎn · နှစ်နာရီ · two o’clock"]','听到数字后不要立即作答，继续听清后面的时间单位。','ကိန်းဂဏန်းကြားသည်နှင့် ချက်ချင်းမဖြေဘဲ နောက်ရှိ အချိန်ယူနစ်ကို ဆက်လက်ရှင်းလင်းစွာ နားထောင်ပါ။','Do not answer as soon as you hear the number; wait for the time unit.')
  on conflict do nothing;

  -- Speaking foundation.
  select id into product from public.knowledge_products where catalog_key='hsk-1-speaking';
  insert into public.knowledge_resource_licenses(product_id,resource_type,title,source_url,author_name,license_code,license_url,attribution_text,verified_at)
  select product,'dataset','HSK Cards HSK 1 vocabulary dataset','https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv','Ted Nyman','MIT','https://github.com/tnm/hsk/blob/main/LICENSE','HSK vocabulary adapted from HSK Cards by Ted Nyman, licensed under the MIT License.',now()
  where not exists(select 1 from public.knowledge_resource_licenses where product_id=product and source_url='https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv');
  insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status)
  values(product,'hsk-1-speaking-foundation','第一章：模仿、跟读与表达','အခန်း ၁ — တုပပြောခြင်း၊ လိုက်ဖတ်ခြင်းနှင့် ဖော်ပြခြင်း','Section 1 — Imitation, repetition and expression',0,'draft')
  on conflict do nothing;
  select id into section_id from public.knowledge_course_sections where catalog_key='hsk-1-speaking-foundation';
  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_id,'hsk-1-speaking-lesson-1','第 1 课：四声与清晰发音','သင်ခန်းစာ ၁ — သံနေသံထားလေးမျိုးနှင့် ရှင်းလင်းသောအသံထွက်','Lesson 1 — Four tones and clear pronunciation',0,true,'draft')
  on conflict do nothing;
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-speaking-lesson-1';
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson_id,'观察拼音声调符号，先慢速模仿，再用正常语速朗读。录音后检查声调、音节完整度和清晰度。','Pinyin သံနေသံထားအမှတ်အသားကို ကြည့်ပြီး ဦးစွာ ဖြည်းဖြည်းတုပပြောပါ။ ထို့နောက် ပုံမှန်အမြန်နှုန်းဖြင့် ဖတ်ပါ။ အသံသွင်းပြီး သံနေသံထား၊ အသံဝဏ္ဏပြည့်စုံမှုနှင့် ရှင်းလင်းမှုကို စစ်ဆေးပါ။','Observe the pinyin tone mark, imitate slowly, then read at normal speed. Record yourself and check tone, syllable completeness and clarity.','["八 · bā · first tone","茶 · chá · second tone","好 · hǎo · third tone","大 · dà · fourth tone"]','自评标准：声调 40 分、音节完整 30 分、清晰度 30 分。','ကိုယ်တိုင်အကဲဖြတ်စံ — သံနေသံထား ၄၀ မှတ်၊ အသံဝဏ္ဏပြည့်စုံမှု ၃၀ မှတ်၊ ရှင်းလင်းမှု ၃၀ မှတ်။','Self-review rubric: tones 40, complete syllables 30, clarity 30.')
  on conflict do nothing;
  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_id,'hsk-1-speaking-lesson-2','第 2 课：自我介绍','သင်ခန်းစာ ၂ — ကိုယ်ရေးမိတ်ဆက်ခြင်း','Lesson 2 — Introduce yourself',1,false,'draft')
  on conflict do nothing;
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-speaking-lesson-2';
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson_id,'使用“我叫……、我是……人、我学习汉语”完成 20–30 秒自我介绍。内容准确比语速更重要。','“我叫……、我是……人、我学习汉语” ကို အသုံးပြုပြီး စက္ကန့် ၂၀–၃၀ ကြာ ကိုယ်ရေးမိတ်ဆက်ပါ။ ပြောနှုန်းထက် အကြောင်းအရာမှန်ကန်မှုက ပိုအရေးကြီးသည်။','Give a 20–30 second introduction using 我叫…, 我是…人 and 我学习汉语. Accuracy matters more than speed.','["我叫…… · ကျွန်ုပ်နာမည်… · my name is…","我是……人 · ကျွန်ုပ်သည်…လူမျိုးဖြစ်သည် · I am from…","我学习汉语 · ကျွန်ုပ်တရုတ်ဘာသာလေ့လာသည် · I study Chinese"]','结构：问候 → 姓名 → 来自哪里 → 学习内容 → 结束语。','ဖွဲ့စည်းပုံ — နှုတ်ဆက် → အမည် → မည်သည့်နေရာမှ → လေ့လာသည့်အကြောင်း → အဆုံးသတ်စကား။','Structure: greeting → name → origin → what you study → closing.')
  on conflict do nothing;

  -- Writing foundation.
  select id into product from public.knowledge_products where catalog_key='hsk-1-writing';
  insert into public.knowledge_resource_licenses(product_id,resource_type,title,source_url,author_name,license_code,license_url,attribution_text,verified_at)
  select product,'dataset','HSK Cards HSK 1 vocabulary dataset','https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv','Ted Nyman','MIT','https://github.com/tnm/hsk/blob/main/LICENSE','HSK vocabulary adapted from HSK Cards by Ted Nyman, licensed under the MIT License.',now()
  where not exists(select 1 from public.knowledge_resource_licenses where product_id=product and source_url='https://github.com/tnm/hsk/blob/main/public/data/hsk1.csv');
  insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status)
  values(product,'hsk-1-writing-foundation','第一章：笔画、汉字与短句','အခန်း ၁ — မျဉ်းချက်၊ တရုတ်စာလုံးနှင့် ဝါကျတို','Section 1 — Strokes, characters and short sentences',0,'draft')
  on conflict do nothing;
  select id into section_id from public.knowledge_course_sections where catalog_key='hsk-1-writing-foundation';
  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_id,'hsk-1-writing-lesson-1','第 1 课：基本笔画和结构','သင်ခန်းစာ ၁ — အခြေခံမျဉ်းချက်နှင့် စာလုံးဖွဲ့စည်းပုံ','Lesson 1 — Basic strokes and structure',0,true,'draft')
  on conflict do nothing;
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-writing-lesson-1';
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson_id,'遵循“从上到下、从左到右、先横后竖”的基本笔顺，练写一、二、八、大、人。','“အပေါ်မှအောက်၊ ဘယ်မှညာ၊ အလျားမျဉ်းဦးစွာ ထောင်မျဉ်းနောက်” အခြေခံရေးစဉ်ကို လိုက်နာပြီး 一、二、八、大、人 ကို လေ့ကျင့်ရေးပါ။','Follow the basic order top-to-bottom, left-to-right and horizontal-before-vertical. Practise 一, 二, 八, 大 and 人.','["一 · yī · တစ် · one","二 · èr · နှစ် · two","八 · bā · ရှစ် · eight","大 · dà · ကြီးသည် · big","人 · rén · လူ · person"]','每个字写五遍，检查笔画方向、相交位置和字形重心。','စာလုံးတစ်လုံးစီကို ငါးကြိမ်ရေးပြီး မျဉ်းချက်ဦးတည်ရာ၊ ဆုံချက်နေရာနှင့် စာလုံးဗဟိုကို စစ်ဆေးပါ။','Write each character five times; check stroke direction, intersections and balance.')
  on conflict do nothing;
  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
  values(product,section_id,'hsk-1-writing-lesson-2','第 2 课：组成简单句','သင်ခန်းစာ ၂ — ရိုးရှင်းသောဝါကျ ဖွဲ့ခြင်း','Lesson 2 — Build simple sentences',1,false,'draft')
  on conflict do nothing;
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-writing-lesson-2';
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
  values(lesson_id,'按“谁 + 做什么 + 什么”的顺序组成简单句，例如“我喝茶”“爸爸看书”。注意不随意添加空格。','“ဘယ်သူ + ဘာလုပ်သည် + ဘာကို” အစဉ်ဖြင့် ရိုးရှင်းသောဝါကျ ဖွဲ့ပါ။ ဥပမာ “我喝茶”“爸爸看书”။ မလိုအပ်ဘဲ space မခြားပါနှင့်။','Build simple sentences in the order who + action + object, such as 我喝茶 and 爸爸看书. Do not add spaces unnecessarily.','["我喝茶 · ကျွန်ုပ် လက်ဖက်ရည်သောက်သည် · I drink tea","爸爸看书 · ဖခင် စာအုပ်ဖတ်သည် · Father reads a book"]','检查清单：主语明确、动词正确、宾语合适、汉字清楚。','စစ်ဆေးရန် — ကတ္တားရှင်းလင်း၊ ကြိယာမှန်၊ ကံပုဒ်သင့်တော်၊ တရုတ်စာလုံးရှင်းလင်း။','Checklist: clear subject, correct verb, suitable object, legible characters.')
  on conflict do nothing;

  -- Draft quizzes and assignments establish assessment evidence for every course.
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-listening-lesson-1';
  insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status)
  values(lesson_id,'hsk-1-listening-quiz-1','听力基础测验','နားထောင်မှုအခြေခံ စစ်ဆေးမှု','Listening foundation quiz',60,'draft')
  on conflict do nothing;
  select id into v_quiz_id from public.knowledge_quizzes where catalog_key='hsk-1-listening-quiz-1';
  delete from public.knowledge_quiz_questions where quiz_id=v_quiz_id;
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,speech_text,position,points)
  values(v_quiz_id,'listening','听发音，选择你听到的字。','အသံထွက်ကို နားထောင်ပြီး ကြားရသောစာလုံးကို ရွေးပါ။','Listen and choose the character you hear.','["八","茶","大"]','八',0,1) returning id into v_question_id;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(v_question_id,'"八"');

  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-speaking-lesson-1';
  insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status)
  values(lesson_id,'hsk-1-speaking-quiz-1','口语准备测验','ပြောဆိုမှုအကြို စစ်ဆေးမှု','Speaking preparation quiz',60,'draft')
  on conflict do nothing;
  select id into v_quiz_id from public.knowledge_quizzes where catalog_key='hsk-1-speaking-quiz-1';
  delete from public.knowledge_quiz_questions where quiz_id=v_quiz_id;
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,position,points)
  values(v_quiz_id,'ordering','排列自我介绍的基本顺序。','ကိုယ်ရေးမိတ်ဆက်၏ အခြေခံအစဉ်ကို စီပါ။','Order the basic parts of an introduction.','["你好","我叫明明","我学习汉语","谢谢"]',0,2) returning id into v_question_id;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(v_question_id,'["你好","我叫明明","我学习汉语","谢谢"]');

  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-1-writing-lesson-1';
  insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status)
  values(lesson_id,'hsk-1-writing-quiz-1','书写基础测验','ရေးသားမှုအခြေခံ စစ်ဆေးမှု','Writing foundation quiz',60,'draft')
  on conflict do nothing;
  select id into v_quiz_id from public.knowledge_quizzes where catalog_key='hsk-1-writing-quiz-1';
  delete from public.knowledge_quiz_questions where quiz_id=v_quiz_id;
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,position,points)
  values(v_quiz_id,'ordering','排列成正确的句子。','မှန်ကန်သောဝါကျဖြစ်အောင် စီပါ။','Put the words in the correct sentence order.','["爸爸","看","书"]',0,2) returning id into v_question_id;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(v_question_id,'["爸爸","看","书"]');

  insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status)
  select id,'hsk-1-listening-assignment-1','听力作业：辨音记录','နားထောင်မှုအိမ်စာ — အသံခွဲခြားမှတ်တမ်း','Listening assignment — Sound log','听五组词并记录汉字、拼音和声调；写下最容易混淆的一组。','စကားလုံး ၅ စုံကို နားထောင်ပြီး တရုတ်စာလုံး၊ Pinyin နှင့် သံနေသံထားကို မှတ်တမ်းတင်ပါ။ အလွယ်ဆုံးမှားနိုင်သောတစ်စုံကို ရေးပါ။','Listen to five word sets and record character, pinyin and tone; identify the pair you confuse most.',100,7,'draft' from public.knowledge_lessons where catalog_key='hsk-1-listening-lesson-1'
  on conflict do nothing;
  insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status)
  select id,'hsk-1-speaking-assignment-1','口语作业：四声录音','ပြောဆိုမှုအိမ်စာ — သံနေသံထားလေးမျိုး အသံသွင်းခြင်း','Speaking assignment — Four-tone recording','录制“八、茶、好、大”及 20–30 秒自我介绍。教师按声调、完整度和清晰度评分。','“八、茶、好、大” နှင့် စက္ကန့် ၂၀–၃၀ ကိုယ်ရေးမိတ်ဆက်ကို အသံသွင်းတင်ပါ။ ဆရာက သံနေသံထား၊ ပြည့်စုံမှုနှင့် ရှင်းလင်းမှုအလိုက် အမှတ်ပေးမည်။','Record 八, 茶, 好 and 大 plus a 20–30 second introduction. The teacher grades tone, completeness and clarity.',100,7,'draft' from public.knowledge_lessons where catalog_key='hsk-1-speaking-lesson-1'
  on conflict do nothing;
  insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status)
  select id,'hsk-1-writing-assignment-1','书写作业：汉字与短句','ရေးသားမှုအိမ်စာ — တရုတ်စာလုံးနှင့် ဝါကျတို','Writing assignment — Characters and sentences','规范书写一、二、八、大、人各五遍，再手写“我喝茶”“爸爸看书”，提交清晰 PDF 或图片。','一、二、八、大、人 ကို စံနှုန်းနှင့်အညီ ငါးကြိမ်စီရေးပြီး “我喝茶”“爸爸看书” ကို လက်ရေးဖြင့်ရေးကာ ရှင်းလင်းသော PDF သို့မဟုတ် ပုံ တင်ပါ။','Write 一, 二, 八, 大 and 人 five times, then handwrite 我喝茶 and 爸爸看书. Submit a clear PDF or image.',100,7,'draft' from public.knowledge_lessons where catalog_key='hsk-1-writing-lesson-1'
  on conflict do nothing;
end$$;

create or replace function public.guard_hsk_course_publication()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.catalog_key like 'hsk-%' and new.status='published' and (old.status is distinct from 'published') then
    if not exists(select 1 from public.knowledge_resource_licenses r where r.product_id=new.id and r.verified_at is not null) then
      raise exception 'HSK publication blocked: verify at least one licensed resource';
    end if;
    if not exists(select 1 from public.knowledge_lessons l where l.product_id=new.id and l.status='published') then
      raise exception 'HSK publication blocked: publish at least one lesson';
    end if;
    if exists(select 1 from public.knowledge_lessons l where l.product_id=new.id and l.status='published' and not exists(select 1 from public.knowledge_lesson_content c where c.lesson_id=l.id and coalesce(c.body_my,c.body_zh,c.body_en,'')<>'')) then
      raise exception 'HSK publication blocked: every published lesson needs content';
    end if;
    if not exists(select 1 from public.knowledge_lessons l join public.knowledge_quizzes q on q.lesson_id=l.id where l.product_id=new.id and q.status='published') then
      raise exception 'HSK publication blocked: publish at least one quiz';
    end if;
    if not exists(select 1 from public.knowledge_lessons l join public.knowledge_assignments a on a.lesson_id=l.id where l.product_id=new.id and a.status='published') then
      raise exception 'HSK publication blocked: publish at least one assignment';
    end if;
  end if;
  return new;
end;$$;

drop function if exists public.get_hsk_course_readiness();
create function public.get_hsk_course_readiness()
returns table(product_id bigint,catalog_key text,published_lessons bigint,content_lessons bigint,published_quizzes bigint,published_assignments bigint,verified_resources bigint,ready boolean)
language sql security invoker stable set search_path=public as $$
  select p.id,p.catalog_key,
    count(distinct l.id) filter(where l.status='published')::bigint,
    count(distinct c.lesson_id) filter(where l.status='published' and coalesce(c.body_my,c.body_zh,c.body_en,'')<>'')::bigint,
    count(distinct q.id) filter(where q.status='published')::bigint,
    count(distinct a.id) filter(where a.status='published')::bigint,
    count(distinct r.id) filter(where r.verified_at is not null)::bigint,
    count(distinct l.id) filter(where l.status='published')>0
      and count(distinct l.id) filter(where l.status='published')=count(distinct c.lesson_id) filter(where l.status='published' and coalesce(c.body_my,c.body_zh,c.body_en,'')<>'')
      and count(distinct q.id) filter(where q.status='published')>0
      and count(distinct a.id) filter(where a.status='published')>0
      and count(distinct r.id) filter(where r.verified_at is not null)>0
  from public.knowledge_products p
  left join public.knowledge_lessons l on l.product_id=p.id
  left join public.knowledge_lesson_content c on c.lesson_id=l.id
  left join public.knowledge_quizzes q on q.lesson_id=l.id
  left join public.knowledge_assignments a on a.lesson_id=l.id
  left join public.knowledge_resource_licenses r on r.product_id=p.id
  where p.catalog_key like 'hsk-%' and public.is_admin_or_moderator()
  group by p.id,p.catalog_key order by p.catalog_key;
$$;
revoke all on function public.get_hsk_course_readiness() from public;
grant execute on function public.get_hsk_course_readiness() to authenticated;
