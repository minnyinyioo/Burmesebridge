-- Publish a complete HSK 3 pilot unit for each skill. Content is original;
-- the vocabulary reference is separately attributed under its MIT license.
do $$
#variable_conflict use_variable
declare v record; product bigint; section_id bigint; lesson_id bigint; quiz_id bigint; question_id bigint;
begin
 for v in select * from (values
 ('listening','听力','နားထောင်မှု','Listening','较长对话中的原因与结果','စကားပြောရှည်အတွင်း အကြောင်းရင်းနှင့် ရလဒ်','Causes and results in longer dialogues',
  '听一段包含转折和因果关系的对话。第一遍确定主题，第二遍记录“因为、所以、但是、后来”连接的信息，最后概括说话人的决定。',
  'ဆန့်ကျင်ဘက်နှင့် အကြောင်းရင်း–ရလဒ်ပါဝင်သော စကားပြောကို နားထောင်ပါ။ ပထမအကြိမ်တွင် ခေါင်းစဉ်ကို သတ်မှတ်ပြီး ဒုတိယအကြိမ်တွင် “因为、所以、但是、后来” ဆက်စပ်သည့်အချက်များကို မှတ်တမ်းတင်ကာ ပြောသူ၏ဆုံးဖြတ်ချက်ကို အကျဉ်းချုပ်ပါ။',
  'Listen to a dialogue containing contrast and cause. Identify the topic, then note information linked by 因为, 所以, 但是 and 后来, and summarize the speaker’s decision.',
  '["因为 · yīnwèi · အကြောင်းမှာ · because","所以 · suǒyǐ · ထို့ကြောင့် · therefore","但是 · dànshì · သို့သော် · but","后来 · hòulái · နောက်ပိုင်း · later"]',
  '听：“因为外面下雨，所以我们后来决定坐地铁。”他们为什么坐地铁？','နားထောင်ပါ — “因为外面下雨，所以我们后来决定坐地铁。” သူတို့ ဘာကြောင့် မြေအောက်ရထားစီးသနည်း။','Listen: “因为外面下雨，所以我们后来决定坐地铁。” Why did they take the metro?','["因为下雨","因为迟到","因为地铁停了"]','因为下雨','因为外面下雨，所以我们后来决定坐地铁。',
  '听力作业：对话逻辑图','နားထောင်မှုအိမ်စာ — စကားပြောယုတ္တိမြေပုံ','Listening assignment — Dialogue logic map','听三段 30–45 秒对话，分别写出主题、原因、结果、转折和最终决定。','စက္ကန့် ၃၀–၄၅ စကားပြော ၃ ပုဒ်ကို နားထောင်ပြီး ခေါင်းစဉ်၊ အကြောင်းရင်း၊ ရလဒ်၊ အလှည့်အပြောင်းနှင့် နောက်ဆုံးဆုံးဖြတ်ချက်ကို ရေးပါ။','Listen to three 30–45 second dialogues and record the topic, cause, result, contrast and final decision.'),
 ('speaking','口语','ပြောဆိုမှု','Speaking','经历描述与理由说明','အတွေ့အကြုံဖော်ပြခြင်းနှင့် အကြောင်းပြချက်ရှင်းလင်းခြင်း','Describing experiences and giving reasons',
  '按“时间—地点—经过—感受”描述一次经历，并使用“先、然后、最后”保持表达连贯。回答追问时，用“因为……所以……”说明理由。',
  'အတွေ့အကြုံတစ်ခုကို “အချိန်—နေရာ—ဖြစ်စဉ်—ခံစားချက်” အစဉ်ဖြင့် ဖော်ပြပြီး “先、然后、最后” ကို အသုံးပြု၍ ဆက်စပ်ပြောပါ။ ထပ်မေးခွန်းကို “因为……所以……” ဖြင့် အကြောင်းပြချက်ရှင်းပါ။',
  'Describe an experience in the order time–place–events–feeling, using 先, 然后 and 最后. Use 因为…所以… when explaining a reason.',
  '["经过 · jīngguò · ဖြစ်စဉ် · experience","最后 · zuìhòu · နောက်ဆုံး · finally","觉得 · juéde · ထင်မြင်သည် · feel","满意 · mǎnyì · ကျေနပ်သည် · satisfied"]',
  '哪一句最适合说明理由？','မည်သည့်ဝါကျက အကြောင်းပြချက်ကို အကောင်းဆုံးရှင်းပြသနည်း။','Which sentence best explains a reason?','["我昨天去。","因为交通方便，所以我坐地铁。","天气很好吗？"]','因为交通方便，所以我坐地铁。',null,
  '口语作业：两分钟经历叙述','ပြောဆိုမှုအိမ်စာ — နှစ်မိနစ်အတွေ့အကြုံဖော်ပြခြင်း','Speaking assignment — Two-minute experience','录制 90–120 秒，描述一次旅行、学习或工作经历。必须包含时间顺序、一个原因和个人感受。','ခရီးသွား၊ လေ့လာ သို့မဟုတ် အလုပ်အတွေ့အကြုံကို စက္ကန့် ၉၀–၁၂၀ အသံသွင်းပါ။ အချိန်အစဉ်၊ အကြောင်းရင်းတစ်ခုနှင့် ကိုယ်ပိုင်ခံစားချက် ပါရမည်။','Record 90–120 seconds about a travel, study or work experience, including sequence, one reason and a personal reaction.'),
 ('reading','阅读','ဖတ်ရှုမှု','Reading','短文主旨、细节与推断','စာပိုဒ်တို၏ အဓိကအကြောင်း၊ အသေးစိတ်နှင့် ကောက်ချက်','Main ideas, details and inference',
  '阅读 150–200 字短文时，先看标题和首尾句判断主旨，再标记人物、时间、态度变化，最后根据上下文推断生词含义。',
  'တရုတ်စာလုံး ၁၅၀–၂၀၀ ပါ စာပိုဒ်ကို ဖတ်ရာတွင် ခေါင်းစဉ်နှင့် အစ–အဆုံးဝါကျမှ အဓိကအကြောင်းကို သတ်မှတ်ပါ။ လူ၊ အချိန်နှင့် သဘောထားပြောင်းလဲမှုကို မှတ်သားပြီး စာစပ်မှ စကားလုံးအသစ်၏အဓိပ္ပာယ်ကို ကောက်ချက်ချပါ။',
  'For a 150–200 character text, use the title and opening/closing sentences to find the main idea. Mark people, time and attitude changes, then infer new words from context.',
  '["主要 · zhǔyào · အဓိက · main","情况 · qíngkuàng · အခြေအနေ · situation","发现 · fāxiàn · တွေ့ရှိသည် · discover","原来 · yuánlái · မူလက · it turns out"]',
  '短文先说小李不喜欢运动，后来他每天跑步，身体更好了。主要变化是什么？','စာပိုဒ်တွင် အစက 小李 အားကစားမကြိုက်သော်လည်း နောက်ပိုင်း နေ့တိုင်းပြေး၍ ကျန်းမာလာသည်။ အဓိကပြောင်းလဲမှုမှာ ဘာလဲ။','Xiao Li disliked exercise, then ran daily and became healthier. What is the main change?','["他换了工作","他开始运动并更健康","他不再出门"]','他开始运动并更健康',null,
  '阅读作业：短文证据表','ဖတ်ရှုမှုအိမ်စာ — စာပိုဒ်အထောက်အထားဇယား','Reading assignment — Evidence table','阅读两篇短文，为每篇写出主旨、三个支持细节、一个推断及对应原文证据。','စာပိုဒ် ၂ ပုဒ်ကို ဖတ်ပြီး တစ်ပုဒ်စီအတွက် အဓိကအကြောင်း၊ ထောက်ခံအသေးစိတ် ၃ ခု၊ ကောက်ချက် ၁ ခုနှင့် မူရင်းအထောက်အထား ရေးပါ။','Read two texts and provide the main idea, three supporting details, one inference and the source evidence for each.'),
 ('writing','书写','ရေးသားမှု','Writing','段落结构与信息衔接','စာပိုဒ်ဖွဲ့စည်းပုံနှင့် အချက်အလက်ဆက်စပ်မှု','Paragraph structure and cohesion',
  '写 100–120 字短文，包含主题句、两至三个支持句和结束句。使用时间词、因果词和转折词连接信息，完成后检查重复、语序和标点。',
  'တရုတ်စာလုံး ၁၀၀–၁၂၀ ပါ စာပိုဒ်တွင် ခေါင်းစဉ်ဝါကျ၊ ထောက်ခံဝါကျ ၂–၃ ခုနှင့် အဆုံးသတ်ဝါကျ ပါစေ။ အချိန်၊ အကြောင်းရင်း–ရလဒ်နှင့် ဆန့်ကျင်ဆက်စပ်စကားလုံးများသုံးပြီး ထပ်ရေးမှု၊ စကားလုံးအစဉ်နှင့် ပုဒ်ဖြတ်ပုဒ်ရပ်ကို စစ်ဆေးပါ။',
  'Write 100–120 Chinese characters with a topic sentence, two or three supporting sentences and a conclusion. Connect ideas with time, cause and contrast markers, then check repetition, order and punctuation.',
  '["首先 · shǒuxiān · ဦးစွာ · first","其次 · qícì · ဒုတိယ · secondly","虽然 · suīrán · သော်လည်း · although","因此 · yīncǐ · ထို့ကြောင့် · therefore"]',
  '选择衔接最自然的句子：“虽然今天很忙，____。”','ဆက်စပ်မှုအသဘာဝကျဆုံးဝါကျကို ရွေးပါ — “虽然今天很忙，____。”','Choose the most natural completion: “虽然今天很忙，____。”','["但是我还是完成了作业","所以昨天是星期一","首先天气很好吗"]','但是我还是完成了作业',null,
  '写作作业：一次有意义的经历','ရေးသားမှုအိမ်စာ — အဓိပ္ပာယ်ရှိသောအတွေ့အကြုံ','Writing assignment — A meaningful experience','用 100–120 个汉字写一次有意义的经历，包含主题句、时间顺序、原因、感受和结束句。','အဓိပ္ပာယ်ရှိသောအတွေ့အကြုံတစ်ခုကို တရုတ်စာလုံး ၁၀၀–၁၂၀ ဖြင့်ရေးပါ။ ခေါင်းစဉ်ဝါကျ၊ အချိန်အစဉ်၊ အကြောင်းရင်း၊ ခံစားချက်နှင့် အဆုံးသတ်ဝါကျ ပါရမည်။','Write 100–120 Chinese characters about a meaningful experience, including a topic sentence, sequence, reason, feeling and conclusion.')
 ) as x(skill,skill_zh,skill_my,skill_en,unit_zh,unit_my,unit_en,body_zh,body_my,body_en,vocabulary,prompt_zh,prompt_my,prompt_en,options,answer,speech_text,assignment_zh,assignment_my,assignment_en,instructions_zh,instructions_my,instructions_en)
 loop
  select id into product from public.knowledge_products where catalog_key='hsk-3-'||v.skill;
  if product is null then raise exception 'Missing HSK 3 course: %',v.skill; end if;
  insert into public.knowledge_resource_licenses(product_id,resource_type,title,source_url,author_name,license_code,license_url,attribution_text,verified_at)
  select product,'dataset','HSK Cards HSK 3 vocabulary dataset','https://github.com/tnm/hsk/blob/main/public/data/hsk3.csv','Ted Nyman','MIT','https://github.com/tnm/hsk/blob/main/LICENSE','HSK 3 vocabulary adapted from HSK Cards by Ted Nyman under the MIT License.',now()
  where not exists(select 1 from public.knowledge_resource_licenses where product_id=product and source_url='https://github.com/tnm/hsk/blob/main/public/data/hsk3.csv');
  insert into public.knowledge_course_sections(product_id,catalog_key,title_zh,title_my,title_en,position,status) values(product,'hsk-3-'||v.skill||'-foundation','第一章：'||v.unit_zh,'အခန်း ၁ — '||v.unit_my,'Section 1 — '||v.unit_en,0,'published') on conflict do nothing;
  select id into section_id from public.knowledge_course_sections where catalog_key='hsk-3-'||v.skill||'-foundation';
  insert into public.knowledge_lessons(product_id,section_id,catalog_key,title_zh,title_my,title_en,position,free_preview,status) values(product,section_id,'hsk-3-'||v.skill||'-lesson-1','第 1 课：'||v.unit_zh,'သင်ခန်းစာ ၁ — '||v.unit_my,'Lesson 1 — '||v.unit_en,0,true,'published') on conflict do nothing;
  select id into lesson_id from public.knowledge_lessons where catalog_key='hsk-3-'||v.skill||'-lesson-1';
  insert into public.knowledge_lesson_content(lesson_id,body_zh,body_my,body_en,vocabulary,handout_zh,handout_my,handout_en) values(lesson_id,v.body_zh,v.body_my,v.body_en,v.vocabulary::jsonb,'学习流程：预习 → 精读或精听 → 完成测验 → 提交作业。','လေ့လာမှုအစဉ် — ကြိုလေ့လာ → အသေးစိတ်ဖတ်/နားထောင် → စစ်ဆေးမှု → အိမ်စာတင်။','Study flow: preview → close reading/listening → quiz → assignment.') on conflict do nothing;
  insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status) values(lesson_id,'hsk-3-'||v.skill||'-quiz-1',v.skill_zh||'随堂测验',v.skill_my||' စစ်ဆေးမှု',v.skill_en||' lesson quiz',60,'published') on conflict do nothing;
  select id into quiz_id from public.knowledge_quizzes where catalog_key='hsk-3-'||v.skill||'-quiz-1';
  if not exists(select 1 from public.knowledge_quiz_questions q where q.quiz_id=quiz_id) then
   insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,speech_text,position,points) values(quiz_id,case when v.skill='listening' then 'listening' else 'single' end,v.prompt_zh,v.prompt_my,v.prompt_en,v.options::jsonb,v.speech_text,0,2) returning id into question_id;
   insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(question_id,to_jsonb(v.answer));
  end if;
  insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status) values(lesson_id,'hsk-3-'||v.skill||'-assignment-1',v.assignment_zh,v.assignment_my,v.assignment_en,v.instructions_zh,v.instructions_my,v.instructions_en,100,7,'published') on conflict do nothing;
  update public.knowledge_products set status='published',description_zh='HSK 3 '||v.skill_zh||'课程：'||v.unit_zh||'，包含多语言讲义、测验和教师批改作业。',description_my='HSK 3 '||v.skill_my||' သင်တန်း — '||v.unit_my||'၊ ဘာသာစုံသင်ခန်းစာ၊ စစ်ဆေးမှုနှင့် ဆရာစစ်ဆေးသည့် အိမ်စာ ပါဝင်သည်။',description_en='HSK 3 '||lower(v.skill_en)||' course covering '||lower(v.unit_en)||', with multilingual notes, assessment and instructor-reviewed assignment.' where id=product;
 end loop;
end $$;
