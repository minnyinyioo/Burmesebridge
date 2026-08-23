-- Publish only the completed HSK 1 pilot. HSK 2–6 remain drafts until their
-- lessons, assessments and licensed sources have passed the same checks.
update public.knowledge_course_sections
set status='published'
where catalog_key like 'hsk-1-%-foundation'
   or catalog_key in ('hsk-1-reading-basics','hsk-1-reading-daily','hsk-1-reading-time');

update public.knowledge_lessons
set status='published'
where catalog_key like 'hsk-1-%-lesson-%';

update public.knowledge_quizzes q
set status='published'
where exists(
  select 1 from public.knowledge_lessons l
  where l.id=q.lesson_id and l.catalog_key like 'hsk-1-%-lesson-%'
);

update public.knowledge_assignments a
set status='published'
where exists(
  select 1 from public.knowledge_lessons l
  where l.id=a.lesson_id and l.catalog_key like 'hsk-1-%-lesson-%'
);

update public.knowledge_products
set status='published',
    description_zh=case skill
      when 'Listening' then 'HSK 1 听力入门课程：训练声调、关键词、数字和时间辨听，包含随堂测验与作业。'
      when 'Speaking' then 'HSK 1 口语入门课程：练习四声、清晰发音与基础自我介绍，包含录音作业。'
      when 'Reading' then 'HSK 1 阅读入门课程：学习基础词汇、短句、数字和时间表达，包含测验与书写作业。'
      when 'Writing' then 'HSK 1 书写入门课程：学习基本笔画、汉字结构和简单句组合，包含书写作业。'
      else description_zh end,
    description_my=case skill
      when 'Listening' then 'HSK 1 နားထောင်မှု အခြေခံသင်တန်း — သံနေသံထား၊ အဓိကစကားလုံး၊ ကိန်းဂဏန်းနှင့် အချိန်ကို လေ့ကျင့်ပြီး စစ်ဆေးမှုနှင့် အိမ်စာ ပါဝင်သည်။'
      when 'Speaking' then 'HSK 1 ပြောဆိုမှု အခြေခံသင်တန်း — သံနေသံထားလေးမျိုး၊ ရှင်းလင်းသောအသံထွက်နှင့် ကိုယ်ရေးမိတ်ဆက်ကို လေ့ကျင့်ပြီး အသံသွင်းအိမ်စာ ပါဝင်သည်။'
      when 'Reading' then 'HSK 1 ဖတ်ရှုမှု အခြေခံသင်တန်း — အခြေခံဝေါဟာရ၊ ဝါကျတို၊ ကိန်းဂဏန်းနှင့် အချိန်ဖော်ပြချက်ကို လေ့လာပြီး စစ်ဆေးမှုနှင့် စာရေးအိမ်စာ ပါဝင်သည်။'
      when 'Writing' then 'HSK 1 ရေးသားမှု အခြေခံသင်တန်း — အခြေခံမျဉ်းချက်၊ တရုတ်စာလုံးဖွဲ့စည်းပုံနှင့် ရိုးရှင်းသောဝါကျကို လေ့လာပြီး စာရေးအိမ်စာ ပါဝင်သည်။'
      else description_my end,
    description_en=case skill
      when 'Listening' then 'HSK 1 listening foundations covering tones, key words, numbers and time, with quizzes and assignments.'
      when 'Speaking' then 'HSK 1 speaking foundations covering the four tones, clear pronunciation and a basic self-introduction, with a recording assignment.'
      when 'Reading' then 'HSK 1 reading foundations covering core vocabulary, short sentences, numbers and time, with quizzes and writing assignments.'
      when 'Writing' then 'HSK 1 writing foundations covering basic strokes, character structure and simple sentence building, with handwriting assignments.'
      else description_en end
where catalog_key in ('hsk-1-listening','hsk-1-speaking','hsk-1-reading','hsk-1-writing');
