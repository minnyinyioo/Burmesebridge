alter table public.knowledge_quiz_questions add column if not exists speech_text text;
alter table public.knowledge_quizzes add column if not exists catalog_key text;
alter table public.knowledge_assignments add column if not exists catalog_key text;
create unique index if not exists knowledge_quizzes_catalog_key_unique on public.knowledge_quizzes(catalog_key) where catalog_key is not null;
create unique index if not exists knowledge_assignments_catalog_key_unique on public.knowledge_assignments(catalog_key) where catalog_key is not null;

do $$
declare
  lesson bigint;
  quiz bigint;
  question bigint;
begin
  select id into lesson from public.knowledge_lessons where catalog_key='hsk-1-reading-lesson-1';
  insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status)
  values(lesson,'hsk-1-reading-quiz-1','第 1 课随堂测验','သင်ခန်းစာ ၁ လေ့ကျင့်စစ်ဆေးမှု','Lesson 1 knowledge check',60,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set lesson_id=excluded.lesson_id returning id into quiz;
  delete from public.knowledge_quiz_questions where quiz_id=quiz;
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,position,points)
  values(quiz,'single','请选择“爱”的意思。','“爱”၏ အဓိပ္ပာယ်ကို ရွေးပါ။','Choose the meaning of 爱.','["ချစ်သည် / to love","လက်ဖက်ရည် / tea","ခွက် / cup"]',0,1) returning id into question;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer,explanation_zh,explanation_my,explanation_en)
  values(question,'"ချစ်သည် / to love"','爱（ài）表示喜爱或热爱。','爱（ài）သည် ချစ်ခြင်းကို ဆိုလိုသည်။','爱 (ài) means to love.');
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,speech_text,position,points)
  values(quiz,'listening','听发音，选择你听到的汉字。','အသံထွက်ကို နားထောင်ပြီး ကြားရသော တရုတ်စာလုံးကို ရွေးပါ။','Listen and choose the character you hear.','["茶","八","爱"]','茶',1,1) returning id into question;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(question,'"茶"');

  select id into lesson from public.knowledge_lessons where catalog_key='hsk-1-reading-lesson-2';
  insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status)
  values(lesson,'hsk-1-reading-quiz-2','第 2 课随堂测验','သင်ခန်းစာ ၂ လေ့ကျင့်စစ်ဆေးမှု','Lesson 2 knowledge check',60,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set lesson_id=excluded.lesson_id returning id into quiz;
  delete from public.knowledge_quiz_questions where quiz_id=quiz;
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,position,points)
  values(quiz,'ordering','把词语排列成正确的句子。','မှန်ကန်သော ဝါကျဖြစ်အောင် စကားလုံးများကို အစဉ်လိုက်စီပါ။','Put the words in the correct order.','["我","喝","茶"]',0,2) returning id into question;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(question,'["我","喝","茶"]');
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,position,points)
  values(quiz,'fill','填写动词：我___米饭。','ကြိယာကို ဖြည့်ပါ — 我___米饭。','Fill in the verb: 我___米饭。','[]',1,1) returning id into question;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(question,'"吃"');

  select id into lesson from public.knowledge_lessons where catalog_key='hsk-1-reading-lesson-3';
  insert into public.knowledge_quizzes(lesson_id,catalog_key,title_zh,title_my,title_en,passing_score,status)
  values(lesson,'hsk-1-reading-quiz-3','第 3 课随堂测验','သင်ခန်းစာ ၃ လေ့ကျင့်စစ်ဆေးမှု','Lesson 3 knowledge check',60,'draft')
  on conflict(catalog_key) where catalog_key is not null do update set lesson_id=excluded.lesson_id returning id into quiz;
  delete from public.knowledge_quiz_questions where quiz_id=quiz;
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,speech_text,position,points)
  values(quiz,'listening','听发音，选择正确的时间。','အသံထွက်ကို နားထောင်ပြီး မှန်ကန်သောအချိန်ကို ရွေးပါ။','Listen and choose the correct time.','["八点","二点","八分钟"]','八点',0,1) returning id into question;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(question,'"八点"');
  insert into public.knowledge_quiz_questions(quiz_id,question_type,prompt_zh,prompt_my,prompt_en,options,position,points)
  values(quiz,'single','“多少”用于询问什么？','“多少” ကို မည်သည့်အရာ မေးရန် သုံးသနည်း။','What does 多少 ask about?','["数量 / အရေအတွက် / quantity","地点 / နေရာ / place","人物 / လူ / person"]',1,1) returning id into question;
  insert into public.knowledge_quiz_answer_keys(question_id,correct_answer) values(question,'"数量 / အရေအတွက် / quantity"');

  insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status)
  select id,'hsk-1-reading-assignment-1','第 1 课作业：识读与书写','သင်ခန်းစာ ၁ အိမ်စာ — ဖတ်ရှုခြင်းနှင့် ရေးသားခြင်း','Lesson 1 assignment — Read and write','朗读本课 10 个词，每个汉字规范抄写 3 遍，并用“爱”或“茶”写一个短句。可提交文字或 PDF。','ဤသင်ခန်းစာရှိ ဝေါဟာရ ၁၀ လုံးကို အသံထွက်ဖတ်ပါ။ တရုတ်စာလုံးတစ်လုံးစီကို စံနှုန်းနှင့်အညီ ၃ ကြိမ်ရေးပြီး “爱” သို့မဟုတ် “茶” ဖြင့် ဝါကျတိုတစ်ကြောင်း ရေးပါ။ စာသား သို့မဟုတ် PDF ဖြင့် တင်နိုင်သည်။','Read all 10 words aloud, copy each character three times, and write one short sentence using 爱 or 茶. Submit text or PDF.',100,7,'draft'
  from public.knowledge_lessons where catalog_key='hsk-1-reading-lesson-1'
  on conflict(catalog_key) where catalog_key is not null do update set instructions_zh=excluded.instructions_zh,instructions_my=excluded.instructions_my,instructions_en=excluded.instructions_en;
  insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status)
  select id,'hsk-1-reading-assignment-2','第 2 课作业：日常短句','သင်ခန်းစာ ၂ အိမ်စာ — နေ့စဉ်သုံးဝါကျတို','Lesson 2 assignment — Daily sentences','使用“吃、喝、看、读、工作”各写一个主谓结构短句，共 5 句。','“吃、喝、看、读、工作” တစ်လုံးစီကို အသုံးပြု၍ ကတ္တား-ကြိယာ ပါသော ဝါကျတို စုစုပေါင်း ၅ ကြောင်း ရေးပါ။','Write five short subject–verb sentences, one each with 吃, 喝, 看, 读 and 工作.',100,7,'draft'
  from public.knowledge_lessons where catalog_key='hsk-1-reading-lesson-2'
  on conflict(catalog_key) where catalog_key is not null do update set instructions_zh=excluded.instructions_zh,instructions_my=excluded.instructions_my,instructions_en=excluded.instructions_en;
  insert into public.knowledge_assignments(lesson_id,catalog_key,title_zh,title_my,title_en,instructions_zh,instructions_my,instructions_en,max_score,due_days,status)
  select id,'hsk-1-reading-assignment-3','第 3 课作业：数字与时间','သင်ခန်းစာ ၃ အိမ်စာ — ကိန်းဂဏန်းနှင့် အချိန်','Lesson 3 assignment — Numbers and time','用中文写出三个日常时间，并为每个时间配一个活动。例如：八点工作。','နေ့စဉ်အချိန် ၃ ခုကို တရုတ်ဘာသာဖြင့် ရေးပြီး အချိန်တစ်ခုစီအတွက် လုပ်ဆောင်ချက်တစ်ခု ထည့်ပါ။ ဥပမာ — 八点工作。','Write three everyday times in Chinese and pair each with an activity, for example: 八点工作。',100,7,'draft'
  from public.knowledge_lessons where catalog_key='hsk-1-reading-lesson-3'
  on conflict(catalog_key) where catalog_key is not null do update set instructions_zh=excluded.instructions_zh,instructions_my=excluded.instructions_my,instructions_en=excluded.instructions_en;
end$$;
