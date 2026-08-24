-- HSK 2 four-skill pilot. Every published course receives localized lesson
-- content, an assessment, an assignment and a verified commercial-use source.
do $$
#variable_conflict use_variable
declare
  v record;
  product bigint;
  section_id bigint;
  lesson_id bigint;
  quiz_id bigint;
  question_id bigint;
begin
  for v in
    select * from (values
      ('listening','听力','နားထောင်မှု','Listening','日常对话与关键信息','နေ့စဉ်စကားပြောနှင့် အဓိကအချက်အလက်','Everyday dialogue and key information',
       '听两遍简短对话，先判断人物关系，再记录时间、地点和动作。练习材料使用“今天、一起、准备、已经、还”等 HSK 2 词语。',
       'စကားပြောတိုကို နှစ်ကြိမ်နားထောင်ပါ။ ဦးစွာ ပြောသူများ၏ ဆက်နွယ်မှုကို သတ်မှတ်ပြီး အချိန်၊ နေရာနှင့် လုပ်ဆောင်ချက်ကို မှတ်တမ်းတင်ပါ။ “今天、一起、准备、已经、还” စသည့် HSK 2 ဝေါဟာရများကို လေ့ကျင့်ပါ။',
       'Listen to each short dialogue twice. Identify the speakers’ relationship, then record the time, place and action. Practise HSK 2 words including 今天, 一起, 准备, 已经 and 还.',
       '["今天 · jīntiān · ယနေ့ · today","一起 · yìqǐ · အတူတကွ · together","准备 · zhǔnbèi · ပြင်ဆင်သည် · prepare","已经 · yǐjīng · ပြီးနှင့်ပြီ · already","还 · hái · သေးသည် · still"]',
       '听录音：“我们下午三点一起去学校。”他们几点去学校？','“我们下午三点一起去学校。” ကို နားထောင်ပါ။ သူတို့ ဘယ်အချိန် ကျောင်းသွားမည်နည်း။','Listen: “我们下午三点一起去学校。” What time will they go to school?','["上午三点","下午三点","下午四点"]','下午三点','我们下午三点一起去学校。',
       '听力作业：信息记录表','နားထောင်မှုအိမ်စာ — အချက်အလက်မှတ်တမ်း','Listening assignment — Information log','听五段日常短句，分别记录人物、时间、地点和动作，并写出两个容易混淆的词。','နေ့စဉ်သုံးဝါကျတို ၅ ခုကို နားထောင်ပြီး လူ၊ အချိန်၊ နေရာနှင့် လုပ်ဆောင်ချက်ကို မှတ်တမ်းတင်ကာ မှားယွင်းလွယ်သော စကားလုံး ၂ လုံး ရေးပါ။','Listen to five everyday sentences. Record person, time, place and action, then identify two easily confused words.'),
      ('speaking','口语','ပြောဆိုမှု','Speaking','提问、回答与连贯表达','မေးမြန်းခြင်း၊ ဖြေကြားခြင်းနှင့် ဆက်စပ်ပြောဆိုခြင်း','Questions, answers and connected speech',
       '围绕时间、地点和计划完成问答。先使用“什么时候、为什么、怎么”，再用完整句回答；不要只说一个词。',
       'အချိန်၊ နေရာနှင့် အစီအစဉ်အကြောင်း မေးဖြေပါ။ “什么时候、为什么、怎么” ကို အသုံးပြုပြီး စကားလုံးတစ်လုံးတည်းမဟုတ်ဘဲ ဝါကျပြည့်ဖြင့် ဖြေပါ။',
       'Practise questions and answers about time, place and plans. Use 什么时候, 为什么 and 怎么, and answer in complete sentences rather than one word.',
       '["什么时候 · shénme shíhou · ဘယ်အချိန် · when","为什么 · wèishénme · ဘာကြောင့် · why","怎么 · zěnme · ဘယ်လို · how","因为 · yīnwèi · အကြောင်းမှာ · because"]',
       '选择最完整的回答：“你为什么学习汉语？”','အပြည့်စုံဆုံးအဖြေကို ရွေးပါ — “你为什么学习汉语？”','Choose the most complete answer to “你为什么学习汉语？”','["汉语","因为我喜欢汉语。","学习"]','因为我喜欢汉语。',null,
       '口语作业：一分钟问答','ပြောဆိုမှုအိမ်စာ — တစ်မိနစ် မေးဖြေ','Speaking assignment — One-minute Q&A','录制 45–60 秒音频，回答什么时候学习、在哪里学习、为什么学习汉语。教师按准确度、连贯度和发音评分。','တရုတ်ဘာသာကို ဘယ်အချိန်၊ ဘယ်နေရာတွင်နှင့် ဘာကြောင့်လေ့လာသည်ကို ဖြေသော ၄၅–၆၀ စက္ကန့် အသံဖိုင်တင်ပါ။ ဆရာက မှန်ကန်မှု၊ ဆက်စပ်ပြောဆိုမှုနှင့် အသံထွက်ကို အမှတ်ပေးမည်။','Submit a 45–60 second recording answering when, where and why you study Chinese. The instructor grades accuracy, fluency and pronunciation.'),
      ('reading','阅读','ဖတ်ရှုမှု','Reading','通知、时间与简单叙述','အသိပေးစာ၊ အချိန်နှင့် ရိုးရှင်းသောဖော်ပြချက်','Notices, time and simple narration',
       '阅读短通知时先找日期、时间、地点，再判断人物要做什么。注意“从……到……、离、每、最”等词在句中的作用。',
       'အသိပေးစာတိုကို ဖတ်ရာတွင် ရက်စွဲ၊ အချိန်နှင့် နေရာကို ဦးစွာရှာပြီး မည်သူ ဘာလုပ်မည်ကို သတ်မှတ်ပါ။ “从……到……、离、每、最” တို့၏ ဝါကျအတွင်း အခန်းကဏ္ဍကို သတိပြုပါ။',
       'When reading a short notice, find the date, time and place first, then determine the action. Notice how 从…到…, 离, 每 and 最 work in the sentence.',
       '["从……到…… · …မှ…အထိ · from…to…","离 · lí · …မှအကွာအဝေး · away from","每 · měi · တိုင်း · every","最 · zuì · အများဆုံး · most"]',
       '阅读：“图书馆星期一到星期五上午九点开门。”图书馆星期二几点开门？','ဖတ်ပါ — “图书馆星期一到星期五上午九点开门。” အင်္ဂါနေ့ စာကြည့်တိုက် ဘယ်အချိန်ဖွင့်သနည်း။','Read: “图书馆星期一到星期五上午九点开门。” When does it open on Tuesday?','["上午八点","上午九点","下午九点"]','上午九点',null,
       '阅读作业：提取通知信息','ဖတ်ရှုမှုအိမ်စာ — အသိပေးစာအချက်အလက် ထုတ်ယူခြင်း','Reading assignment — Extract notice details','阅读三则短通知，制作“日期、时间、地点、人物、事项”表格，并用中文回答五个问题。','အသိပေးစာတို ၃ ခုကို ဖတ်ပြီး ရက်စွဲ၊ အချိန်၊ နေရာ၊ လူနှင့် အကြောင်းအရာဇယား ပြုလုပ်ကာ မေးခွန်း ၅ ခုကို တရုတ်ဘာသာဖြင့် ဖြေပါ။','Read three short notices, create a date/time/place/person/action table, and answer five questions in Chinese.'),
      ('writing','书写','ရေးသားမှု','Writing','语序、连接词与短段落','စကားလုံးအစဉ်၊ ဆက်စပ်စကားလုံးနှင့် စာပိုဒ်တို','Word order, connectors and short paragraphs',
       '使用“先……然后……”“因为……所以……”组织句子。写作前确定主语、时间和动作，完成后检查语序、量词与标点。',
       '“先……然后……”“因为……所以……” ကို အသုံးပြု၍ ဝါကျဖွဲ့ပါ။ မရေးမီ ကတ္တား၊ အချိန်နှင့် လုပ်ဆောင်ချက်ကို သတ်မှတ်ပြီးနောက် စကားလုံးအစဉ်၊ ရေတွက်ပုဒ်နှင့် ပုဒ်ဖြတ်ပုဒ်ရပ်ကို စစ်ဆေးပါ။',
       'Use 先…然后… and 因为…所以… to connect ideas. Before writing, identify subject, time and action; then check word order, measure words and punctuation.',
       '["先 · xiān · ဦးစွာ · first","然后 · ránhòu · ထို့နောက် · then","因为 · yīnwèi · အကြောင်းမှာ · because","所以 · suǒyǐ · ထို့ကြောင့် · therefore"]',
       '选择正确语序。','မှန်ကန်သော စကားလုံးအစဉ်ကို ရွေးပါ။','Choose the correct word order.','["我每天学习汉语一个小时。","我一个小时汉语每天学习。","每天一个学习我汉语小时。"]','我每天学习汉语一个小时。',null,
       '写作作业：我的一天','ရေးသားမှုအိမ်စာ — ကျွန်ုပ်၏တစ်နေ့တာ','Writing assignment — My day','用 60–80 个汉字写“我的一天”，至少使用两个时间词和一组“先……然后……”。提交 PDF 或清晰图片。','“ကျွန်ုပ်၏တစ်နေ့တာ” အကြောင်း တရုတ်စာလုံး ၆၀–၈၀ ဖြင့်ရေးပါ။ အချိန်စကားလုံး ၂ လုံးနှင့် “先……然后……” တစ်စုံ အနည်းဆုံးသုံးပြီး PDF သို့မဟုတ် ရှင်းလင်းသောပုံ တင်ပါ။','Write 60–80 Chinese characters about “My day”, using at least two time expressions and one 先…然后… sequence. Submit a PDF or clear image.')
    ) as x(skill,skill_zh,skill_my,skill_en,unit_zh,unit_my,unit_en,body_zh,body_my,body_en,vocabulary,prompt_zh,prompt_my,prompt_en,options,answer,speech_text,assignment_zh,assignment_my,assignment_en,instructions_zh,instructions_my,instructions_en)
  loop
    select id into product from public.knowledge_products where catalog_key='hsk-2-'||v.skill;
    if product is null then raise exception 'Missing HSK 2 course: %',v.skill; end if;

    insert into public.knowledge_resource_licenses(product_id,resource_type,title,source_url,author_name,license_code,license_url,attribution_text,verified_at)
    select product,'dataset','HSK Cards HSK 2 vocabulary dataset','https://github.com/tnm/hsk/blob/main/public/data/hsk2.csv','Ted Nyman','MIT','https://github.com/tnm/hsk/blob/main/LICENSE','HSK 2 vocabulary adapted from HSK Cards by Ted Nyman under the MIT License.',now()
    where not exists(select 1 from public.knowledge_resource_licenses where product_id=product and source_url='https://github.com/tnm/hsk/blob/main/public/data/hsk2.csv');

    insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status)
    values(product,'hsk-2-'||v.skill||'-foundation','第一章：'||v.unit_zh,'အခန်း ၁ — '||v.unit_my,'Section 1 — '||v.unit_en,0,'published') on conflict do nothing;
    select id into section_id from public.knowledge_course_sections where catalog_key='hsk-2-'||v.skill||'-foundation';

    insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status)
    values(product,section_id,'hsk-2-'||v.skill||'-lesson-1','第 1 课：'||v.unit_zh,'သင်ခန်းစာ ၁ — '||v.unit_my,'Lesson 1 — '||v.unit_en,0,true,'published') on conflict do nothing;
    select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-2-'||v.skill||'-lesson-1';

    insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en)
    values(lesson_id,v.body_zh,v.body_my,v.body_en,v.vocabulary::jsonb,'学习流程：预习词汇 → 完成课文 → 做随堂测验 → 提交作业。','လေ့လာမှုအစဉ် — ဝေါဟာရကြိုလေ့လာ → သင်ခန်းစာပြီးစီး → စစ်ဆေးမှုဖြေ → အိမ်စာတင်။','Study flow: preview vocabulary → complete the lesson → take the quiz → submit the assignment.') on conflict do nothing;

    insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status)
    values(lesson_id,'hsk-2-'||v.skill||'-quiz-1',v.skill_zh||'随堂测验',v.skill_my||' စစ်ဆေးမှု',v.skill_en||' lesson quiz',60,'published') on conflict do nothing;
    select id into quiz_id from public.knowledge_quizzes where catalog_key='hsk-2-'||v.skill||'-quiz-1';
    if not exists(select 1 from public.knowledge_quiz_questions q where q.quiz_id=quiz_id) then
      insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,speech_text,position,points)
      values(quiz_id,case when v.skill='listening' then 'listening' else 'single' end,v.prompt_zh,v.prompt_my,v.prompt_en,v.options::jsonb,v.speech_text,0,2) returning id into question_id;
      insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(question_id,to_jsonb(v.answer));
    end if;

    insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status)
    values(lesson_id,'hsk-2-'||v.skill||'-assignment-1',v.assignment_zh,v.assignment_my,v.assignment_en,v.instructions_zh,v.instructions_my,v.instructions_en,100,7,'published') on conflict do nothing;

    update public.knowledge_products set status='published',
      description_zh='HSK 2 '||v.skill_zh||'课程：'||v.unit_zh||'，包含多语言讲义、随堂测验和教师批改作业。',
      description_my='HSK 2 '||v.skill_my||' သင်တန်း — '||v.unit_my||'၊ ဘာသာစုံသင်ခန်းစာ၊ စစ်ဆေးမှုနှင့် ဆရာစစ်ဆေးသည့် အိမ်စာ ပါဝင်သည်။',
      description_en='HSK 2 '||lower(v.skill_en)||' course covering '||lower(v.unit_en)||', with multilingual notes, a quiz and instructor-reviewed assignment.'
    where id=product;
  end loop;
end $$;
