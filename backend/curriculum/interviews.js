/**
 * Mock interviews: role-based, three rounds each (concepts, a case scenario,
 * a Python task run in the learner's browser). Answers stay on the server;
 * lib/interview.js picks a paper per session and grades it.
 *
 * DRAFT text (needs_review): awaiting a native-speaker pass, see CONTENT_REVIEW.md.
 * Each coding task's `expected` values are checked against `reference` by
 * backend/test/interviews.test.js.
 */

/* Skills the scorecard reports on, and the lessons that teach each one. */
const SKILLS = {
  logs:       { uz: 'Loglarni oʻqish', ru: 'Чтение логов', modules: ['logging-and-monitoring', 'siem-and-alerts', 'linux-packages-logs'] },
  ir:         { uz: 'Hodisaga javob', ru: 'Реагирование на инциденты', modules: ['incident-response', 'siem-and-alerts'] },
  networking: { uz: 'Tarmoqlar', ru: 'Сети', modules: ['tcp-and-udp', 'dns-basics', 'what-is-a-firewall'] },
  threats:    { uz: 'Hujum turlari', ru: 'Типы атак', modules: ['common-attacks', 'malware-basics', 'threats-and-risks'] },
  phishing:   { uz: 'Fishing tahlili', ru: 'Анализ фишинга', modules: ['social-engineering-tactics', 'links-and-attachments', 'read-the-message'] },
  recon:      { uz: 'Razvedka va skanerlash', ru: 'Разведка и сканирование', modules: ['reconnaissance', 'scanning-and-enumeration'] },
  exploit:    { uz: 'Ekspluatatsiya', ru: 'Эксплуатация', modules: ['exploitation-basics', 'privilege-escalation-and-lateral-movement'] },
  web:        { uz: 'Veb zaifliklar', ru: 'Веб-уязвимости', modules: ['what-is-sql-injection', 'xss-basics', 'broken-access-control', 'csrf'] },
  reporting:  { uz: 'Etika va hisobot', ru: 'Этика и отчёт', modules: ['ethics-and-authorization', 'reporting-and-remediation'] },
  crypto:     { uz: 'Kriptografiya', ru: 'Криптография', modules: ['hashing-vs-encryption', 'password-hashing', 'tls-certificates'] },
  auth:       { uz: 'Autentifikatsiya', ru: 'Аутентификация', modules: ['authentication-and-sessions', 'passwords-and-mfa'] },
  cloud:      { uz: 'Bulut xavfsizligi', ru: 'Облачная безопасность', modules: ['shared-responsibility', 'cloud-identity-and-access', 'cloud-storage-security'] },
  hardening:  { uz: 'Himoyani kuchaytirish', ru: 'Укрепление защиты', modules: ['security-headers', 'hardening-and-patching', 'vulnerability-management'] },
  python:     { uz: 'Python skriptlar', ru: 'Python-скрипты', modules: ['python-security-scripting', 'python-data-structures'] },
};

/* ── SOC analyst ────────────────────────────────────────────────────────── */
const SOC = {
  slug: 'soc-analyst',
  icon: 'shield-check',
  level: 'junior',
  needs_review: true,
  title: { uz: 'SOC tahlilchisi (L1)', ru: 'Аналитик SOC (L1)' },
  summary: {
    uz: 'Ogohlantirishlarni saralash, loglardan hujumni topish va hodisani toʻgʻri eskalatsiya qilish.',
    ru: 'Сортировка алертов, поиск атаки в логах и правильная эскалация инцидента.',
  },
  skills: ['logs', 'ir', 'networking', 'threats', 'phishing', 'python'],
  brief: [
    {
      title: { uz: 'Ogohlantirishni saralash (triage)', ru: 'Сортировка алертов (триаж)' },
      body: {
        uz: `SOC tahlilchisining asosiy ishi - har bir ogohlantirishga tez va asosli javob berish. Har bir alert uchun uchta savolga javob toping:

1. **Bu haqiqiy hujummi?** *True positive* - haqiqiy tahdid; *false positive* - qoida notoʻgʻri ishlagan; *benign true positive* - qoida toʻgʻri ishlagan, lekin harakat ruxsat etilgan (masalan, administrator skaneri).
2. **Qanchalik jiddiy?** Jiddiylik = taʼsir × ehtimollik. Muvaffaqiyatli kirish, imtiyozli hisob yoki koʻp xostga tarqalish - yuqori darajadagi belgilar.
3. **Kimga uzataman?** L1 tahlilchi hodisani yopmaydi - u dalillarni yigʻadi, playbook boʻyicha birinchi choralarni koʻradi va L2 ga *aniq xulosa* bilan uzatadi.

> Yaxshi eskalatsiya: "203.0.113.45 dan 'admin' ga 480 ta muvaffaqiyatsiz urinish, 02:14 da muvaffaqiyatli kirish, soʻng yangi foydalanuvchi yaratildi. Xost tarmoqdan ajratildi."

Kontekstni doim tekshiring: bu IP ilgari koʻringanmi, foydalanuvchi odatda qayerdan kiradi, xost qanchalik muhim.`,
        ru: `Главная работа аналитика SOC - быстро и обоснованно реагировать на каждый алерт. Для каждого алерта ответьте на три вопроса:

1. **Это реальная атака?** *True positive* - реальная угроза; *false positive* - правило сработало ошибочно; *benign true positive* - правило сработало верно, но действие разрешено (например, сканер администратора).
2. **Насколько серьёзно?** Серьёзность = воздействие × вероятность. Успешный вход, привилегированная учётная запись или распространение на несколько хостов - признаки высокого уровня.
3. **Кому передать?** Аналитик L1 не закрывает инцидент сам - он собирает доказательства, выполняет первые шаги плейбука и передаёт L2 с *чётким выводом*.

> Хорошая эскалация: «480 неудачных попыток на 'admin' с 203.0.113.45, успешный вход в 02:14, затем создан новый пользователь. Хост изолирован от сети».

Всегда проверяйте контекст: видели ли этот IP раньше, откуда обычно входит пользователь, насколько важен хост.`,
      },
    },
    {
      title: { uz: 'Loglarni oʻqish', ru: 'Чтение логов' },
      body: {
        uz: `Log - bu "kim, nima, qachon, qayerdan" savollariga javob. Eng koʻp uchraydigan manbalar:

| Manba | Nimani koʻrsatadi | Muhim maydonlar |
|---|---|---|
| Linux \`/var/log/auth.log\` | SSH va sudo | \`Failed password\`, \`Accepted\`, IP, foydalanuvchi |
| Windows Security | Kirishlar | 4624 (muvaffaqiyatli), 4625 (muvaffaqiyatsiz), 4720 (yangi hisob) |
| Veb-server access log | HTTP soʻrovlar | IP, metod, yoʻl, status kodi, User-Agent |
| DNS / proxy | Tashqi aloqalar | Domen, vaqt, hajm |

**Vaqt chizigʻi (timeline)** tuzing: hodisalarni vaqt boʻyicha tartiblang va har bir qadamni bitta qatorda yozing. Barcha tizimlarda vaqt **NTP** orqali sinxron boʻlishi shart - aks holda turli loglarni solishtirib boʻlmaydi.

Belgilarga eʼtibor bering: qisqa vaqtda koʻp \`4625\`, kechasi gʻayrioddiy mamlakatdan kirish, bir xil oraliqda takrorlanuvchi DNS soʻrovlari (*beaconing*).`,
        ru: `Лог отвечает на вопросы «кто, что, когда, откуда». Самые частые источники:

| Источник | Что показывает | Важные поля |
|---|---|---|
| Linux \`/var/log/auth.log\` | SSH и sudo | \`Failed password\`, \`Accepted\`, IP, пользователь |
| Windows Security | Входы | 4624 (успешный), 4625 (неудачный), 4720 (новая учётка) |
| Access-лог веб-сервера | HTTP-запросы | IP, метод, путь, код ответа, User-Agent |
| DNS / прокси | Внешние соединения | Домен, время, объём |

Стройте **таймлайн**: упорядочьте события по времени и опишите каждый шаг одной строкой. Время на всех системах должно быть синхронизировано через **NTP** - иначе логи разных систем не сопоставить.

Обращайте внимание на признаки: много \`4625\` за короткое время, ночной вход из необычной страны, DNS-запросы через равные интервалы (*beaconing*).`,
      },
    },
    {
      title: { uz: 'Hodisaga javob berish bosqichlari', ru: 'Этапы реагирования на инцидент' },
      body: {
        uz: `NIST SP 800-61 boʻyicha hodisaga javob toʻrt bosqichdan iborat:

1. **Tayyorgarlik** - playbooklar, kontaktlar roʻyxati, log yigʻish oldindan sozlangan.
2. **Aniqlash va tahlil** - alertni tasdiqlash, koʻlamini aniqlash, dalillarni saqlash.
3. **Cheklash, yoʻq qilish, tiklash** - avval tarqalishni toʻxtatish (xostni ajratish, hisobni bloklash), soʻng sababni yoʻq qilish (zararli fayl, backdoor), keyin xizmatni xavfsiz qayta tiklash.
4. **Hodisadan keyingi tahlil** - nima ishladi, nima ishlamadi, qaysi qoida yoki jarayon oʻzgaradi.

Ikki muhim qoida: **dalilni buzmang** (xostni oʻchirib qoʻyish xotiradagi izlarni yoʻqotadi - tarmoqdan ajratish yaxshiroq) va **har bir harakatni vaqti bilan yozib boring**.`,
        ru: `По NIST SP 800-61 реагирование состоит из четырёх этапов:

1. **Подготовка** - плейбуки, список контактов, сбор логов настроен заранее.
2. **Обнаружение и анализ** - подтвердить алерт, определить масштаб, сохранить доказательства.
3. **Сдерживание, устранение, восстановление** - сначала остановить распространение (изолировать хост, заблокировать учётку), затем устранить причину (вредоносный файл, бэкдор), потом безопасно восстановить сервис.
4. **Разбор после инцидента** - что сработало, что нет, какое правило или процесс меняем.

Два важных правила: **не уничтожайте доказательства** (выключение хоста стирает следы в памяти - лучше изолировать его от сети) и **записывайте каждое действие со временем**.`,
      },
    },
    {
      title: { uz: 'SOC da koʻrinadigan hujumlar', ru: 'Атаки, которые видит SOC' },
      body: {
        uz: `- **Brute force** - bitta hisobga koʻp parol. Belgisi: bitta IP, bitta foydalanuvchi, koʻp xato.
- **Password spraying** - koʻp hisobga bitta-ikkita keng tarqalgan parol. Belgisi: bitta IP, *koʻp* foydalanuvchi, har biriga kam urinish - shuning uchun bloklash qoidalariga tushmaydi.
- **Fishing** - soxta domen (\`paypa1.com\`), SPF/DKIM xatosi, ikki kengaytmali ilova (\`invoice.pdf.exe\`).
- **Beaconing** - zararli dastur boshqaruv serveriga muntazam oraliqda murojaat qiladi.
- **Lateral movement** - bitta hisob qisqa vaqtda koʻp xostga kiradi (RDP 3389, SMB 445).

Har bir hujum uchun **IOC** (Indicator of Compromise) yigʻing: IP, domen, fayl xeshi, URL. Ular boshqa xostlarni tekshirish va bloklash uchun kerak.`,
        ru: `- **Brute force** - много паролей к одной учётке. Признак: один IP, один пользователь, много ошибок.
- **Password spraying** - один-два популярных пароля ко многим учёткам. Признак: один IP, *много* пользователей, мало попыток на каждого - поэтому правила блокировки не срабатывают.
- **Фишинг** - поддельный домен (\`paypa1.com\`), ошибка SPF/DKIM, вложение с двойным расширением (\`invoice.pdf.exe\`).
- **Beaconing** - вредонос обращается к управляющему серверу через равные интервалы.
- **Lateral movement** - одна учётка за короткое время входит на много хостов (RDP 3389, SMB 445).

Для каждой атаки собирайте **IOC** (индикаторы компрометации): IP, домен, хеш файла, URL. Они нужны, чтобы проверить и заблокировать другие хосты.`,
      },
    },
  ],
  concepts: [
    { id: 'soc-c1', skill: 'logs', answer: 1,
      q: { uz: 'Windows Security logida 4625 hodisasi nimani bildiradi?', ru: 'Что означает событие 4625 в журнале Windows Security?' },
      options: { uz: ['Muvaffaqiyatli kirish', 'Muvaffaqiyatsiz kirish urinishi', 'Yangi hisob yaratildi', 'Tizim qayta yuklandi'], ru: ['Успешный вход', 'Неудачная попытка входа', 'Создана новая учётная запись', 'Перезагрузка системы'] },
      why: { uz: '4625 - muvaffaqiyatsiz kirish. 4624 - muvaffaqiyatli, 4720 - yangi hisob.', ru: '4625 - неудачный вход. 4624 - успешный, 4720 - новая учётная запись.' } },
    { id: 'soc-c2', skill: 'threats', answer: 2,
      q: { uz: 'Password spraying hujumini brute force dan nima ajratadi?', ru: 'Чем password spraying отличается от brute force?' },
      options: { uz: ['Faqat SSH ga qilinadi', 'Parol xeshlarini oflayn buzadi', 'Bitta keng tarqalgan parolni koʻp hisoblarga sinaydi', 'Faqat ichki tarmoqdan boʻladi'], ru: ['Проводится только по SSH', 'Взламывает хеши паролей офлайн', 'Пробует один популярный пароль на многих учётках', 'Возможна только из внутренней сети'] },
      why: { uz: 'Spraying har bir hisobga kam urinish qiladi, shuning uchun bloklash chegarasiga yetmaydi.', ru: 'Spraying делает мало попыток на учётку, поэтому не достигает порога блокировки.' } },
    { id: 'soc-c3', skill: 'ir', answer: 0,
      q: { uz: '"False positive" nima?', ru: 'Что такое «false positive»?' },
      options: { uz: ['Qoida ishladi, lekin haqiqiy tahdid yoʻq', 'Hujum boʻldi, lekin qoida ishlamadi', 'Tasdiqlangan hujum', 'Takroriy alert'], ru: ['Правило сработало, но реальной угрозы нет', 'Атака была, но правило не сработало', 'Подтверждённая атака', 'Повторный алерт'] },
      why: { uz: 'Hujum boʻlib, qoida ishlamasa - bu false negative, u ancha xavfliroq.', ru: 'Если атака была, а правило молчало - это false negative, он гораздо опаснее.' } },
    { id: 'soc-c4', skill: 'ir', answer: 3,
      q: { uz: 'Xodimning kompyuterida ransomware xabari paydo boʻldi. Birinchi toʻgʻri qadam?', ru: 'На компьютере сотрудника появилась записка вымогателя. Верный первый шаг?' },
      options: { uz: ['Kompyuterni darhol oʻchirish', 'Toʻlov haqida xabar yozish', 'Fayllarni boshqa diskka koʻchirish', 'Xostni tarmoqdan ajratib, eskalatsiya qilish'], ru: ['Сразу выключить компьютер', 'Написать вымогателям', 'Скопировать файлы на другой диск', 'Изолировать хост от сети и эскалировать'] },
      why: { uz: 'Ajratish tarqalishni toʻxtatadi va xotiradagi dalillarni saqlaydi; oʻchirish ularni yoʻqotadi.', ru: 'Изоляция останавливает распространение и сохраняет следы в памяти; выключение их стирает.' } },
    { id: 'soc-c5', skill: 'networking', answer: 1,
      q: { uz: 'Qaysi belgi beaconing ga koʻproq mos keladi?', ru: 'Какой признак больше всего похож на beaconing?' },
      options: { uz: ['Bitta katta fayl yuklab olindi', 'Har 60 soniyada nodir domenga DNS soʻrovi', 'Ish vaqtida koʻp veb-sahifalar ochildi', 'Printerga koʻp soʻrov'], ru: ['Скачан один большой файл', 'DNS-запрос к редкому домену каждые 60 секунд', 'Много веб-страниц в рабочее время', 'Много запросов к принтеру'] },
      why: { uz: 'Zararli dastur boshqaruv serveriga muntazam, mashinaviy oraliqda murojaat qiladi.', ru: 'Вредонос обращается к управляющему серверу через регулярные, «машинные» интервалы.' } },
    { id: 'soc-c6', skill: 'logs', answer: 2,
      q: { uz: 'SIEM ning asosiy vazifasi nima?', ru: 'Какова главная задача SIEM?' },
      options: { uz: ['Zararli fayllarni oʻchirish', 'Parollarni saqlash', 'Loglarni bir joyga yigʻish va ularni bogʻlab tahlil qilish', 'Trafikni shifrlash'], ru: ['Удалять вредоносные файлы', 'Хранить пароли', 'Собирать логи в одном месте и коррелировать их', 'Шифровать трафик'] },
      why: { uz: 'SIEM turli manbalarni birlashtiradi va korrelyatsiya qoidalari bilan alert hosil qiladi.', ru: 'SIEM объединяет источники и создаёт алерты по правилам корреляции.' } },
    { id: 'soc-c7', skill: 'networking', answer: 0,
      q: { uz: 'RDP qaysi portda ishlaydi?', ru: 'На каком порту работает RDP?' },
      options: { uz: ['3389', '22', '445', '53'], ru: ['3389', '22', '445', '53'] },
      why: { uz: '3389 - RDP, 22 - SSH, 445 - SMB, 53 - DNS.', ru: '3389 - RDP, 22 - SSH, 445 - SMB, 53 - DNS.' } },
    { id: 'soc-c8', skill: 'threats', answer: 3,
      q: { uz: 'Qaysi biri IOC (buzilish belgisi) EMAS?', ru: 'Что из этого НЕ является IOC?' },
      options: { uz: ['Zararli faylning SHA-256 xeshi', 'Boshqaruv serverining IP manzili', 'Fishing domeni', 'Xodimning lavozimi'], ru: ['SHA-256 хеш вредоносного файла', 'IP управляющего сервера', 'Фишинговый домен', 'Должность сотрудника'] },
      why: { uz: 'IOC - texnik belgi, uni boshqa tizimlarda qidirish va bloklash mumkin.', ru: 'IOC - технический признак, который можно искать и блокировать на других системах.' } },
    { id: 'soc-c9', skill: 'logs', answer: 1,
      q: { uz: 'Nega barcha serverlarda vaqt NTP orqali sinxron boʻlishi kerak?', ru: 'Почему время на всех серверах должно синхронизироваться через NTP?' },
      options: { uz: ['Loglar hajmi kamayadi', 'Turli tizimlar loglarini bitta vaqt chizigʻiga qoʻyish uchun', 'Parollar tezroq tekshiriladi', 'Bu faqat sertifikatlar uchun kerak'], ru: ['Уменьшается объём логов', 'Чтобы сводить логи разных систем в один таймлайн', 'Пароли проверяются быстрее', 'Это нужно только для сертификатов'] },
      why: { uz: 'Bir necha daqiqalik farq ham hodisalar ketma-ketligini buzadi.', ru: 'Даже разница в несколько минут ломает последовательность событий.' } },
    { id: 'soc-c10', skill: 'phishing', answer: 2,
      q: { uz: 'Xat haqiqatan qaysi serverdan kelganini qayerdan bilish mumkin?', ru: 'Где видно, с какого сервера на самом деле пришло письмо?' },
      options: { uz: ['"From" maydoni', 'Xat mavzusi', '"Received" sarlavhalari va SPF/DKIM natijasi', 'Imzo rasmidagi logotip'], ru: ['Поле «From»', 'Тема письма', 'Заголовки «Received» и результат SPF/DKIM', 'Логотип в подписи'] },
      why: { uz: '"From" ni soxtalashtirish oson; Received zanjiri va SPF/DKIM tekshiruvi esa server tomonidan yoziladi.', ru: '«From» легко подделать; цепочку Received и проверки SPF/DKIM пишут серверы.' } },
  ],
  scenarios: [
    {
      id: 'soc-s1',
      title: { uz: 'Tungi SSH kirish', ru: 'Ночной вход по SSH' },
      context: {
        uz: `Siz navbatchi L1 tahlilchisiz. SIEM \`web-01\` serveridan "Koʻp muvaffaqiyatsiz SSH kirish" alertini berdi. \`/var/log/auth.log\` dan parcha:

\`\`\`
02:11:04 sshd: Failed password for admin from 203.0.113.45 port 51122
02:11:05 sshd: Failed password for admin from 203.0.113.45 port 51124
   ... (yana 476 qator xuddi shunday) ...
02:14:37 sshd: Accepted password for admin from 203.0.113.45 port 52990
02:15:10 sudo: admin : COMMAND=/usr/sbin/useradd -m backup2
02:15:41 sudo: admin : COMMAND=/usr/bin/crontab -e
\`\`\`

\`admin\` hisobi odatda faqat ish vaqtida ofis IP sidan ishlatiladi.`,
        ru: `Вы дежурный аналитик L1. SIEM выдал алерт «Много неудачных входов по SSH» с сервера \`web-01\`. Фрагмент \`/var/log/auth.log\`:

\`\`\`
02:11:04 sshd: Failed password for admin from 203.0.113.45 port 51122
02:11:05 sshd: Failed password for admin from 203.0.113.45 port 51124
   ... (ещё 476 таких строк) ...
02:14:37 sshd: Accepted password for admin from 203.0.113.45 port 52990
02:15:10 sudo: admin : COMMAND=/usr/sbin/useradd -m backup2
02:15:41 sudo: admin : COMMAND=/usr/bin/crontab -e
\`\`\`

Учётка \`admin\` обычно используется только в рабочее время с офисного IP.`,
      },
      steps: [
        { skill: 'logs', answer: 2,
          q: { uz: 'Loglarga koʻra nima sodir boʻldi?', ru: 'Что произошло, судя по логам?' },
          options: { uz: ['Administrator parolini unutgan', 'Muvaffaqiyatsiz brute force, xavf yoʻq', 'Brute force muvaffaqiyatli boʻldi va hujumchi tizimda harakat qilmoqda', 'Monitoring skaneri ishlagan'], ru: ['Администратор забыл пароль', 'Неудачный brute force, риска нет', 'Brute force удался, и атакующий действует в системе', 'Сработал сканер мониторинга'] },
          why: { uz: '478 ta xatodan keyin "Accepted" va darhol sudo buyruqlari - bu buzilish.', ru: '«Accepted» после 478 ошибок и сразу команды sudo - это компрометация.' } },
        { skill: 'ir', answer: 0,
          q: { uz: 'Hodisaning jiddiyligini qanday baholaysiz?', ru: 'Как вы оцените серьёзность инцидента?' },
          options: { uz: ['Yuqori/kritik: muvaffaqiyatli kirish va imtiyozli harakatlar', 'Past: bu faqat urinishlar', 'Oʻrta: kechasi boʻlgani uchun', 'Baholash shart emas, L2 hal qiladi'], ru: ['Высокая/критическая: успешный вход и привилегированные действия', 'Низкая: это только попытки', 'Средняя: потому что ночью', 'Оценивать не нужно, решит L2'] },
          why: { uz: 'Tasdiqlangan kirish + root huquqlari + yangi hisob = eng yuqori daraja. L1 ham boshlangʻich baho beradi.', ru: 'Подтверждённый вход + права root + новая учётка = высший уровень. L1 тоже даёт первичную оценку.' } },
        { skill: 'ir', answer: 1,
          q: { uz: 'Birinchi navbatda nima qilasiz?', ru: 'Что вы сделаете в первую очередь?' },
          options: { uz: ['Serverni oʻchirib qoʻyaman', 'Playbook boʻyicha cheklayman: IP ni bloklayman, admin va backup2 ni oʻchiraman yoki xostni ajrataman, L2 ga xabar beraman', 'Hujumchi IP siga javob skan qilaman', 'Ertalab administratordan soʻrayman'], ru: ['Выключу сервер', 'Сдержу по плейбуку: заблокирую IP, отключу admin и backup2 или изолирую хост, сообщу L2', 'Просканирую IP атакующего в ответ', 'Утром спрошу администратора'] },
          why: { uz: 'Cheklash tarqalishni toʻxtatadi, dalillar saqlanadi. Qarshi hujum - noqonuniy va xavfli.', ru: 'Сдерживание останавливает распространение, улики сохраняются. Ответная атака незаконна и опасна.' } },
        { skill: 'logs', answer: 3,
          q: { uz: 'Hujumchi nima qilganini aniqlash uchun keyin nimani tekshirasiz?', ru: 'Что проверите дальше, чтобы понять действия атакующего?' },
          options: { uz: ['Faqat veb-sayt ishlayotganini', 'Diskdagi boʻsh joyni', 'Boshqa serverlardagi printer loglarini', 'crontab va ~/.ssh/authorized_keys (qolib ketish), backup2 hisobi, bash tarixi, boshqa xostlarga ulanishlar'], ru: ['Только работу сайта', 'Свободное место на диске', 'Логи принтеров на других серверах', 'crontab и ~/.ssh/authorized_keys (закрепление), учётку backup2, историю bash, подключения к другим хостам'] },
          why: { uz: 'crontab tahriri va yangi hisob - qolib ketish (persistence) belgilari; tarqalishni ham tekshirish kerak.', ru: 'Правка crontab и новая учётка - признаки закрепления; распространение тоже нужно проверить.' } },
      ],
    },
    {
      id: 'soc-s2',
      title: { uz: 'Shubhali hisob-faktura', ru: 'Подозрительный счёт' },
      context: {
        uz: `Buxgalteriya xodimi xatni "shubhali" deb yubordi. Sarlavhalardan:

\`\`\`
From: "PayPal Billing" <billing@paypa1-secure.com>
Subject: Hisobingiz toʻxtatildi - 24 soat ichida tasdiqlang
Received-SPF: fail (domain of paypa1-secure.com does not designate 198.51.100.7)
Attachment: invoice_0391.pdf.exe
Link: http://paypa1-secure.com/login
\`\`\`

Xat bugun ertalab 37 xodimga kelgan.`,
        ru: `Сотрудник бухгалтерии переслал письмо как «подозрительное». Из заголовков:

\`\`\`
From: "PayPal Billing" <billing@paypa1-secure.com>
Subject: Ваш аккаунт приостановлен - подтвердите за 24 часа
Received-SPF: fail (domain of paypa1-secure.com does not designate 198.51.100.7)
Attachment: invoice_0391.pdf.exe
Link: http://paypa1-secure.com/login
\`\`\`

Письмо пришло сегодня утром 37 сотрудникам.`,
      },
      steps: [
        { skill: 'phishing', answer: 1,
          q: { uz: 'Xulosangiz?', ru: 'Ваш вывод?' },
          options: { uz: ['Haqiqiy PayPal xati', 'Fishing', 'Spam, lekin xavfsiz', 'Aniqlab boʻlmaydi'], ru: ['Настоящее письмо PayPal', 'Фишинг', 'Спам, но безопасный', 'Определить нельзя'] },
          why: { uz: 'Bir nechta mustaqil belgi bir xil xulosaga olib keladi.', ru: 'Несколько независимых признаков ведут к одному выводу.' } },
        { skill: 'phishing', answer: 3,
          q: { uz: 'Hisobotda qaysi dalillarni asosiy deb koʻrsatasiz?', ru: 'Какие доказательства укажете в отчёте как главные?' },
          options: { uz: ['Faqat shoshiltiruvchi mavzu', 'Faqat logotip sifati', 'Xat juda qisqa', 'SPF fail, oʻxshash domen (paypa1), ikki kengaytmali .exe ilova, HTTP havola'], ru: ['Только срочная тема', 'Только качество логотипа', 'Письмо слишком короткое', 'SPF fail, похожий домен (paypa1), вложение .exe с двойным расширением, ссылка по HTTP'] },
          why: { uz: 'Texnik dalillar tekshiriladigan va qayta ishlatiladigan IOC beradi.', ru: 'Технические признаки проверяемы и дают IOC для блокировки.' } },
        { skill: 'ir', answer: 0,
          q: { uz: 'Endi nima qilasiz?', ru: 'Что делаете теперь?' },
          options: { uz: ['Pochta va proxy loglaridan kim xatni olgan, ochgan yoki havolani bosganini aniqlayman; xatlarni qutilardan oʻchiraman, domen va xeshni bloklayman', 'Faqat shu bitta xodimga javob yozaman', 'Hamma 37 kishiga "bosmang" deb xat yozaman va kutaman', 'Xatni arxivlab yopaman'], ru: ['По логам почты и прокси найду, кто получил, открыл или кликнул; удалю письма из ящиков, заблокирую домен и хеш', 'Отвечу только этому сотруднику', 'Напишу всем 37 «не кликайте» и подожду', 'Заархивирую письмо и закрою'] },
          why: { uz: 'Koʻlamni aniqlash va xatni hamma qutilardan olib tashlash - asosiy cheklash.', ru: 'Определить масштаб и убрать письмо из всех ящиков - главное сдерживание.' } },
        { skill: 'ir', answer: 2,
          q: { uz: 'Bir xodim havolaga kirib parolini kiritgan. Toʻgʻri choralar?', ru: 'Один сотрудник перешёл по ссылке и ввёл пароль. Верные меры?' },
          options: { uz: ['Xodimga ogohlantirish berish yetarli', 'Kompyuterini almashtirish', 'Parolni almashtirish, barcha sessiyalarni bekor qilish, MFA va pochta qoidalarini (forward) tekshirish, kirish loglarini koʻrish', 'Faqat antivirusni ishga tushirish'], ru: ['Достаточно предупредить сотрудника', 'Заменить компьютер', 'Сменить пароль, отозвать все сессии, проверить MFA и правила почты (пересылку), посмотреть логи входа', 'Только запустить антивирус'] },
          why: { uz: 'Hujumchi parol bilan kirib, pochtaga yashirin forward qoidasi qoʻyishi mumkin.', ru: 'Атакующий может войти по паролю и поставить скрытое правило пересылки почты.' } },
      ],
    },
  ],
  task: {
    slug: 'soc-failed-logins',
    entry: 'solve',
    title: { uz: 'Brute force manbalarini topish', ru: 'Найти источники brute force' },
    statement: {
      uz: `\`solve(lines, limit)\` funksiyasini yozing. \`lines\` - auth.log qatorlari roʻyxati. \`Failed password\` boʻlgan har bir qatorda IP manzil \`from\` soʻzidan keyin keladi.

Muvaffaqiyatsiz urinishlar soni **\`limit\` dan kam boʻlmagan** IP manzillar roʻyxatini qaytaring: urinishlar soni boʻyicha kamayish tartibida, teng boʻlsa - IP satri boʻyicha alifbo tartibida. \`Failed password\` boʻlmagan qatorlarni eʼtiborsiz qoldiring.`,
      ru: `Напишите функцию \`solve(lines, limit)\`. \`lines\` - список строк auth.log. В каждой строке с \`Failed password\` IP-адрес идёт после слова \`from\`.

Верните список IP, у которых неудачных попыток **не меньше \`limit\`**: по убыванию числа попыток, при равенстве - по строке IP в алфавитном порядке. Строки без \`Failed password\` игнорируйте.`,
    },
    constraints: { uz: '`0 ≤ len(lines) ≤ 5000`; `1 ≤ limit ≤ 100`.', ru: '`0 ≤ len(lines) ≤ 5000`; `1 ≤ limit ≤ 100`.' },
    starter: 'def solve(lines, limit):\n    # lines: auth.log satrlari / строки auth.log\n    pass',
    reference: `def solve(lines, limit):
    counts = {}
    for line in lines:
        if 'Failed password' not in line:
            continue
        parts = line.split()
        if 'from' in parts:
            i = parts.index('from')
            if i + 1 < len(parts):
                ip = parts[i + 1]
                counts[ip] = counts.get(ip, 0) + 1
    hits = [ip for ip, n in counts.items() if n >= limit]
    return sorted(hits, key=lambda ip: (-counts[ip], ip))`,
    tests: [
      { args: [['Failed password for root from 10.0.0.5 port 22', 'Failed password for root from 10.0.0.5 port 22', 'Accepted password for bob from 10.0.0.9 port 22', 'Failed password for admin from 10.0.0.5 port 22'], 3], expected: ['10.0.0.5'], hidden: false },
      { args: [[], 1], expected: [], hidden: false },
      { args: [['Failed password for a from 1.1.1.1 port 1', 'Failed password for b from 2.2.2.2 port 1', 'Failed password for c from 2.2.2.2 port 1', 'Failed password for d from 1.1.1.1 port 1'], 2], expected: ['1.1.1.1', '2.2.2.2'], hidden: true },
      { args: [['Failed password for x from 9.9.9.9 port 1', 'Failed password for x from 9.9.9.9 port 1', 'Failed password for y from 8.8.8.8 port 1'], 1], expected: ['9.9.9.9', '8.8.8.8'], hidden: true },
      { args: [['session opened for user root', 'Accepted publickey for ops from 10.1.1.1 port 2'], 1], expected: [], hidden: true },
      { args: [['Failed password for invalid user test from 172.16.0.3 port 3', 'Failed password for invalid user oracle from 172.16.0.3 port 4'], 2], expected: ['172.16.0.3'], hidden: true },
    ],
  },
};

/* ── Junior penetration tester ──────────────────────────────────────────── */
const PENTEST = {
  slug: 'pentester',
  icon: 'terminal-window',
  level: 'junior',
  needs_review: true,
  title: { uz: 'Pentester (junior)', ru: 'Пентестер (junior)' },
  summary: {
    uz: 'Ruxsat doirasida ishlash, zaifliklarni topish va ularni tushunarli hisobotga aylantirish.',
    ru: 'Работа в рамках разрешения, поиск уязвимостей и понятный отчёт о них.',
  },
  skills: ['recon', 'exploit', 'web', 'reporting', 'networking', 'python'],
  brief: [
    {
      title: { uz: 'Ruxsat va qamrov (scope)', ru: 'Разрешение и скоуп' },
      body: {
        uz: `Pentester va jinoyatchi bir xil vositalardan foydalanadi. Farq bitta: **yozma ruxsat**.

Ish boshlanishidan oldin quyidagilar kelishilgan boʻlishi kerak:

- **Qamrov (scope)** - qaysi domenlar, IP diapazonlari va ilovalar tekshiriladi. Roʻyxatda yoʻq narsa - tekshirilmaydi.
- **Qoidalar (Rules of Engagement)** - ish vaqti, ruxsat etilgan usullar (DoS, ijtimoiy muhandislik odatda taqiqlangan), maʼlumotlar bilan ishlash.
- **Toʻxtash shartlari** - kritik zaiflik yoki boshqa hujumchi izlari topilsa, darhol kimga qoʻngʻiroq qilinadi.

Test paytida qamrovdan tashqaridagi tizim topilsa - uni **tekshirmang**, mijozga xabar bering. Maqsad - isbot, zarar emas: zaiflikni tasdiqlash uchun eng kam maʼlumotga kiring.`,
        ru: `Пентестер и преступник пользуются одними инструментами. Разница одна: **письменное разрешение**.

До начала работы должно быть согласовано:

- **Скоуп** - какие домены, диапазоны IP и приложения тестируются. Чего нет в списке - не тестируется.
- **Правила (Rules of Engagement)** - рабочие часы, разрешённые методы (DoS и социальная инженерия обычно запрещены), обращение с данными.
- **Условия остановки** - кому звонить сразу, если найдена критическая уязвимость или следы другого атакующего.

Если во время теста найдена система вне скоупа - **не тестируйте** её, сообщите заказчику. Цель - доказательство, а не ущерб: для подтверждения уязвимости обращайтесь к минимуму данных.`,
      },
    },
    {
      title: { uz: 'Metodologiya', ru: 'Методология' },
      body: {
        uz: `Pentest bosqichma-bosqich boradi - har bir bosqich keyingisi uchun maʼlumot beradi:

1. **Razvedka** - passiv (DNS yozuvlari, sertifikat jurnallari, ochiq manbalar) va aktiv (toʻgʻridan-toʻgʻri soʻrovlar).
2. **Skanerlash va sanash** - ochiq portlar, xizmatlar va versiyalar: \`nmap -sV\`. Har bir xizmat - mumkin boʻlgan kirish nuqtasi.
3. **Ekspluatatsiya** - topilgan zaiflikni ehtiyotkorlik bilan tasdiqlash.
4. **Post-ekspluatatsiya** - imtiyozlarni oshirish (privilege escalation) va boshqa tizimlarga oʻtish imkoniyatini *koʻrsatish*.
5. **Hisobot** - mijoz uchun eng muhim natija.

Har bir qadamda yozib boring: buyruq, vaqt, natija, skrinshot. Hisobotni keyin xotiradan yozib boʻlmaydi.`,
        ru: `Пентест идёт по этапам - каждый даёт данные для следующего:

1. **Разведка** - пассивная (DNS-записи, журналы сертификатов, открытые источники) и активная (прямые запросы).
2. **Сканирование и перечисление** - открытые порты, сервисы и версии: \`nmap -sV\`. Каждый сервис - возможная точка входа.
3. **Эксплуатация** - аккуратное подтверждение найденной уязвимости.
4. **Пост-эксплуатация** - *показать* возможность повышения привилегий и перехода на другие системы.
5. **Отчёт** - самый важный результат для заказчика.

На каждом шаге записывайте: команду, время, результат, скриншот. Отчёт потом по памяти не напишешь.`,
      },
    },
    {
      title: { uz: 'Veb-ilovalarni tekshirish', ru: 'Тестирование веб-приложений' },
      body: {
        uz: `OWASP Top 10 dagi eng koʻp topiladigan sinflar:

- **Broken Access Control / IDOR** - URL dagi \`id=1043\` ni \`1042\` ga oʻzgartirib, boshqa foydalanuvchi maʼlumotini koʻrish. Sabab: server obyekt kimga tegishli ekanini tekshirmaydi.
- **Injection (SQLi)** - foydalanuvchi kiritgan matn soʻrov tarkibiga qoʻshiladi. Himoya: parametrlangan soʻrovlar.
- **XSS** - sahifaga begona skript joylash. *Reflected* - havolada, *stored* - serverda saqlanib, boshqalarga koʻrsatiladi.
- **Autentifikatsiya xatolari** - cheklovsiz parol tanlash, sessiya tokeni chiqib ketishi.

Tekshirishda ikki test hisobidan foydalaning (A va B): A ning sessiyasi bilan B ning obyektlariga kirib koʻring - bu IDOR ni xavfsiz tasdiqlashning eng toʻgʻri yoʻli.`,
        ru: `Самые частые классы из OWASP Top 10:

- **Broken Access Control / IDOR** - поменять \`id=1043\` на \`1042\` в URL и увидеть чужие данные. Причина: сервер не проверяет, кому принадлежит объект.
- **Injection (SQLi)** - ввод пользователя попадает в текст запроса. Защита: параметризованные запросы.
- **XSS** - внедрение чужого скрипта на страницу. *Reflected* - в ссылке, *stored* - сохраняется на сервере и показывается другим.
- **Ошибки аутентификации** - подбор пароля без ограничений, утечка токена сессии.

При проверке используйте две тестовые учётки (A и B): сессией A обратитесь к объектам B - это самый корректный способ безопасно подтвердить IDOR.`,
      },
    },
    {
      title: { uz: 'Topilmani yozish', ru: 'Как описать находку' },
      body: {
        uz: `Yaxshi topilma dasturchi uni oʻqib, takrorlab, tuzatishi uchun yetarli:

- **Sarlavha** - "Invoices API da IDOR: istalgan mijozning hisob-fakturasini oʻqish".
- **Jiddiylik** - CVSS asosida (masalan, 8.1 High) va qisqa asos.
- **Taʼsir** - biznes tilida: "barcha mijozlarning ismi, manzili va toʻlov summalari oshkor boʻladi".
- **Takrorlash qadamlari** - aniq soʻrovlar bilan.
- **Dalil** - soʻrov/javob, skrinshot (shaxsiy maʼlumotlar yashirilgan).
- **Tuzatish** - aniq tavsiya: "har bir soʻrovda invoice.owner_id == session.user_id ni server tomonida tekshiring".

Hisobot boshida rahbariyat uchun bir sahifalik xulosa boʻladi: eng xavfli 3 ta topilma va umumiy holat.`,
        ru: `Хорошая находка позволяет разработчику прочитать, воспроизвести и исправить её:

- **Заголовок** - «IDOR в Invoices API: чтение счёта любого клиента».
- **Серьёзность** - по CVSS (например, 8.1 High) и краткое обоснование.
- **Влияние** - на языке бизнеса: «раскрываются имена, адреса и суммы платежей всех клиентов».
- **Шаги воспроизведения** - с точными запросами.
- **Доказательство** - запрос/ответ, скриншот (персональные данные скрыты).
- **Исправление** - конкретно: «на сервере проверяйте invoice.owner_id == session.user_id в каждом запросе».

В начале отчёта - резюме на одну страницу для руководства: три самые опасные находки и общее состояние.`,
      },
    },
  ],
  concepts: [
    { id: 'pt-c1', skill: 'reporting', answer: 2,
      q: { uz: 'Mijoz serverini tekshirishdan oldin nima boʻlishi shart?', ru: 'Что обязательно нужно до тестирования сервера заказчика?' },
      options: { uz: ['Yaxshi VPN', 'Ogʻzaki kelishuv', 'Yozma ruxsat va kelishilgan qamrov', 'Serverning IP manzili'], ru: ['Хороший VPN', 'Устная договорённость', 'Письменное разрешение и согласованный скоуп', 'IP-адрес сервера'] },
      why: { uz: 'Yozma ruxsatsiz test - qonunbuzarlik, hatto niyat yaxshi boʻlsa ham.', ru: 'Тест без письменного разрешения - правонарушение, даже при добрых намерениях.' } },
    { id: 'pt-c2', skill: 'recon', answer: 0,
      q: { uz: 'Qaysi biri passiv razvedka?', ru: 'Что из этого пассивная разведка?' },
      options: { uz: ['Sertifikat jurnallaridan (crt.sh) subdomenlarni topish', 'nmap bilan portlarni skanerlash', 'Login formasiga parollar yuborish', 'Saytga fuzzing qilish'], ru: ['Поиск поддоменов в журналах сертификатов (crt.sh)', 'Сканирование портов nmap', 'Перебор паролей в форме входа', 'Фаззинг сайта'] },
      why: { uz: 'Passiv razvedka nishon tizimiga toʻgʻridan-toʻgʻri soʻrov yubormaydi.', ru: 'Пассивная разведка не отправляет запросов напрямую в целевую систему.' } },
    { id: 'pt-c3', skill: 'recon', answer: 1,
      q: { uz: '`nmap -sV` nima qiladi?', ru: 'Что делает `nmap -sV`?' },
      options: { uz: ['Zaifliklarni avtomatik ekspluatatsiya qiladi', 'Ochiq portlardagi xizmat va versiyalarni aniqlaydi', 'Faqat ping yuboradi', 'Trafikni shifrlaydi'], ru: ['Автоматически эксплуатирует уязвимости', 'Определяет сервисы и версии на открытых портах', 'Только отправляет ping', 'Шифрует трафик'] },
      why: { uz: 'Versiya maʼlum boʻlsa, unga tegishli maʼlum zaifliklarni (CVE) qidirish mumkin.', ru: 'Зная версию, можно искать известные для неё уязвимости (CVE).' } },
    { id: 'pt-c4', skill: 'web', answer: 3,
      q: { uz: '`/profile?id=17` ni `id=18` ga almashtirsangiz, boshqa odamning profili ochiladi. Bu qanday zaiflik?', ru: 'Меняете `/profile?id=17` на `id=18` и видите чужой профиль. Что это за уязвимость?' },
      options: { uz: ['XSS', 'CSRF', 'SQL injection', 'IDOR (Broken Access Control)'], ru: ['XSS', 'CSRF', 'SQL injection', 'IDOR (Broken Access Control)'] },
      why: { uz: 'Server soʻralgan obyekt joriy foydalanuvchiga tegishli ekanini tekshirmayapti.', ru: 'Сервер не проверяет, принадлежит ли объект текущему пользователю.' } },
    { id: 'pt-c5', skill: 'web', answer: 0,
      q: { uz: 'SQL injection ga qarshi asosiy himoya?', ru: 'Главная защита от SQL injection?' },
      options: { uz: ['Parametrlangan soʻrovlar (prepared statements)', 'Qoʻshtirnoqlarni oʻchirib tashlash', 'WAF ning oʻzi', 'Xato xabarlarini yashirish'], ru: ['Параметризованные запросы (prepared statements)', 'Удалять кавычки', 'Только WAF', 'Скрывать сообщения об ошибках'] },
      why: { uz: 'Parametrlar maʼlumotni koddan ajratadi; qolganlari faqat qoʻshimcha qatlam.', ru: 'Параметры отделяют данные от кода; остальное - лишь дополнительные слои.' } },
    { id: 'pt-c6', skill: 'web', answer: 2,
      q: { uz: 'Stored XSS reflected XSS dan nimasi bilan xavfliroq?', ru: 'Чем stored XSS опаснее reflected?' },
      options: { uz: ['U faqat adminlarga taʼsir qiladi', 'U HTTPS ni buzadi', 'Skript serverda saqlanadi va sahifani ochgan har bir kishida ishlaydi', 'Uni topish osonroq'], ru: ['Он влияет только на админов', 'Он ломает HTTPS', 'Скрипт хранится на сервере и выполняется у каждого, кто открыл страницу', 'Его легче найти'] },
      why: { uz: 'Reflected uchun qurbon maxsus havolani bosishi kerak; stored - hech narsa talab qilmaydi.', ru: 'Для reflected жертва должна перейти по особой ссылке; для stored - ничего не нужно.' } },
    { id: 'pt-c7', skill: 'reporting', answer: 1,
      q: { uz: 'Test paytida qamrovda yoʻq server topildi. Nima qilasiz?', ru: 'Во время теста найден сервер вне скоупа. Ваши действия?' },
      options: { uz: ['Tez tekshirib, hisobotga qoʻshaman', 'Unga tegmayman va mijozga xabar beraman', 'Faqat port skan qilaman', 'Eʼtiborsiz qoldiraman'], ru: ['Быстро проверю и добавлю в отчёт', 'Не трогаю и сообщаю заказчику', 'Только просканирую порты', 'Проигнорирую'] },
      why: { uz: 'Qamrovdan tashqari har qanday harakat ruxsatsiz hisoblanadi.', ru: 'Любое действие вне скоупа считается несанкционированным.' } },
    { id: 'pt-c8', skill: 'exploit', answer: 3,
      q: { uz: '"Privilege escalation" nima?', ru: 'Что такое «privilege escalation»?' },
      options: { uz: ['Parolni tiklash', 'Yangi server qoʻshish', 'Tarmoq tezligini oshirish', 'Oddiy foydalanuvchidan yuqori huquqlarga (root/admin) erishish'], ru: ['Сброс пароля', 'Добавление сервера', 'Ускорение сети', 'Получение более высоких прав (root/admin) из обычного пользователя'] },
      why: { uz: 'Masalan, notoʻgʻri sudo sozlamasi yoki SUID fayl orqali root boʻlish.', ru: 'Например, стать root через неверную настройку sudo или SUID-файл.' } },
    { id: 'pt-c9', skill: 'reporting', answer: 0,
      q: { uz: 'CVSS nima uchun ishlatiladi?', ru: 'Для чего используется CVSS?' },
      options: { uz: ['Zaiflik jiddiyligini standart shkalada baholash uchun', 'Parollarni shifrlash uchun', 'Portlarni skanerlash uchun', 'Loglarni saqlash uchun'], ru: ['Для оценки серьёзности уязвимости по стандартной шкале', 'Для шифрования паролей', 'Для сканирования портов', 'Для хранения логов'] },
      why: { uz: 'CVSS 0-10 ball beradi; u ustuvorlikni belgilashga yordam beradi.', ru: 'CVSS даёт оценку 0-10; это помогает расставить приоритеты.' } },
    { id: 'pt-c10', skill: 'networking', answer: 2,
      q: { uz: '445/tcp portida odatda qaysi xizmat ishlaydi?', ru: 'Какой сервис обычно работает на порту 445/tcp?' },
      options: { uz: ['HTTPS', 'DNS', 'SMB', 'SSH'], ru: ['HTTPS', 'DNS', 'SMB', 'SSH'] },
      why: { uz: 'SMB - Windows fayl almashinuvi; internetga ochiq boʻlmasligi kerak.', ru: 'SMB - общий доступ к файлам Windows; не должен быть открыт в интернет.' } },
  ],
  scenarios: [
    {
      id: 'pt-s1',
      title: { uz: 'Hisob-fakturalar API si', ru: 'API счетов' },
      context: {
        uz: `Siz mijozning veb-ilovasini tekshiryapsiz (qamrovda). Test hisobingiz bilan:

\`\`\`
GET /api/invoices?id=1043
Authorization: Bearer <test_user_A>
→ 200 {"id":1043,"owner":"test_user_A","amount":120.00}

GET /api/invoices?id=1042
Authorization: Bearer <test_user_A>
→ 200 {"id":1042,"owner":"m.karimova","address":"Toshkent, ...","amount":4800.00}
\`\`\`

Hisob-faktura raqamlari ketma-ket.`,
        ru: `Вы тестируете веб-приложение заказчика (в скоупе). С вашей тестовой учёткой:

\`\`\`
GET /api/invoices?id=1043
Authorization: Bearer <test_user_A>
→ 200 {"id":1043,"owner":"test_user_A","amount":120.00}

GET /api/invoices?id=1042
Authorization: Bearer <test_user_A>
→ 200 {"id":1042,"owner":"m.karimova","address":"Ташкент, ...","amount":4800.00}
\`\`\`

Номера счетов идут подряд.`,
      },
      steps: [
        { skill: 'web', answer: 1,
          q: { uz: 'Bu qanday zaiflik?', ru: 'Что это за уязвимость?' },
          options: { uz: ['SQL injection', 'IDOR - obyekt darajasida ruxsat tekshirilmaydi', 'XSS', 'Muammo yoʻq, API shunday ishlaydi'], ru: ['SQL injection', 'IDOR - нет проверки доступа на уровне объекта', 'XSS', 'Проблемы нет, API так и работает'] },
          why: { uz: 'A foydalanuvchisi boshqa mijozning hisob-fakturasini oldi.', ru: 'Пользователь A получил счёт другого клиента.' } },
        { skill: 'reporting', answer: 3,
          q: { uz: 'Zaiflikni qanchalik chuqur tasdiqlaysiz?', ru: 'Насколько глубоко будете подтверждать?' },
          options: { uz: ['Barcha hisob-fakturalarni skript bilan yuklab olaman - toʻliq isbot uchun', 'Hech narsa qilmayman, taxmin yetarli', 'Mijoz maʼlumotini oʻzgartirib koʻraman', 'Ikkinchi test hisobi (B) bilan minimal tasdiqlayman, haqiqiy mijoz maʼlumotlarini saqlamayman'], ru: ['Скачаю все счета скриптом - для полного доказательства', 'Ничего, предположения достаточно', 'Попробую изменить данные клиента', 'Минимально подтвержу со второй тестовой учёткой (B), реальные данные клиентов не сохраняю'] },
          why: { uz: 'Isbot uchun minimal kirish yetarli; ommaviy yuklab olish - haqiqiy maʼlumotlar oqishi.', ru: 'Для доказательства хватает минимального доступа; массовая выгрузка - это реальная утечка.' } },
        { skill: 'reporting', answer: 0,
          q: { uz: 'Jiddiyligini qanday belgilaysiz?', ru: 'Какую серьёзность поставите?' },
          options: { uz: ['Yuqori: har qanday mijozning shaxsiy va moliyaviy maʼlumoti oshkor', 'Past: faqat oʻqish mumkin', 'Informational', 'Oʻrta: faqat bitta yozuv koʻrildi'], ru: ['Высокая: раскрыты личные и финансовые данные любого клиента', 'Низкая: можно только читать', 'Informational', 'Средняя: видна только одна запись'] },
          why: { uz: 'ID lar ketma-ket - demak barcha yozuvlar bir xil tarzda ochiq.', ru: 'ID последовательные - значит, все записи открыты так же.' } },
        { skill: 'web', answer: 2,
          q: { uz: 'Qanday tuzatishni tavsiya qilasiz?', ru: 'Какое исправление порекомендуете?' },
          options: { uz: ['ID larni tasodifiy (UUID) qilish', 'API ni faqat HTTPS orqali ishlatish', 'Server tomonida har soʻrovda obyekt egasi joriy foydalanuvchi ekanini tekshirish', 'Rate limit qoʻyish'], ru: ['Сделать ID случайными (UUID)', 'Работать с API только по HTTPS', 'На сервере проверять в каждом запросе, что владелец объекта - текущий пользователь', 'Добавить rate limit'] },
          why: { uz: 'UUID faqat taxmin qilishni qiyinlashtiradi; sabab - ruxsat tekshiruvi yoʻqligi.', ru: 'UUID лишь усложняет угадывание; причина - отсутствие проверки доступа.' } },
      ],
    },
    {
      id: 'pt-s2',
      title: { uz: 'Tashqi perimetr', ru: 'Внешний периметр' },
      context: {
        uz: `Qamrovdagi \`203.0.113.20\` serverini skanerladingiz:

\`\`\`
$ nmap -sV 203.0.113.20
21/tcp   open  ftp     vsftpd 2.3.4  (Anonymous login allowed)
22/tcp   open  ssh     OpenSSH 8.9p1
80/tcp   open  http    nginx 1.24.0
3306/tcp open  mysql   MySQL 5.7.33
\`\`\`

Anonim FTP da \`config.bak\` fayli bor.`,
        ru: `Вы просканировали сервер \`203.0.113.20\` из скоупа:

\`\`\`
$ nmap -sV 203.0.113.20
21/tcp   open  ftp     vsftpd 2.3.4  (Anonymous login allowed)
22/tcp   open  ssh     OpenSSH 8.9p1
80/tcp   open  http    nginx 1.24.0
3306/tcp open  mysql   MySQL 5.7.33
\`\`\`

На анонимном FTP лежит файл \`config.bak\`.`,
      },
      steps: [
        { skill: 'recon', answer: 2,
          q: { uz: 'Qaysi xizmatni birinchi tekshirasiz?', ru: 'Какой сервис проверите первым?' },
          options: { uz: ['SSH - u eng mashhur', 'nginx - u yangi versiya', 'FTP - anonim kirish ochiq va versiya juda eski', 'Hammasini bir vaqtda brute force qilaman'], ru: ['SSH - он самый популярный', 'nginx - свежая версия', 'FTP - открыт анонимный вход и версия очень старая', 'Брутфорс всех сразу'] },
          why: { uz: 'Anonim kirish + eski versiya = eng tez va ehtimoliy kirish nuqtasi.', ru: 'Анонимный вход + старая версия = самая вероятная точка входа.' } },
        { skill: 'networking', answer: 0,
          q: { uz: 'MySQL 3306 portining internetga ochiqligi nima xavf tugʻdiradi?', ru: 'Чем опасен MySQL 3306, открытый в интернет?' },
          options: { uz: ['Parol tanlash va maʼlumotlar bazasiga toʻgʻridan-toʻgʻri hujum imkoniyati', 'Hech qanday - parol bor', 'Sayt sekinlashadi', 'Faqat DNS ga taʼsir qiladi'], ru: ['Возможен подбор пароля и прямая атака на базу', 'Никакой - там пароль', 'Сайт замедлится', 'Влияет только на DNS'] },
          why: { uz: 'MB faqat ilova serveridan yoki VPN orqali ochiq boʻlishi kerak.', ru: 'БД должна быть доступна только с сервера приложения или через VPN.' } },
        { skill: 'reporting', answer: 1,
          q: { uz: '`config.bak` ichida MB paroli bor ekan. Toʻgʻri harakat?', ru: 'В `config.bak` оказался пароль от БД. Верное действие?' },
          options: { uz: ['Darhol MB ga kirib, hamma jadvallarni yuklab olaman', 'Topilmani dalil bilan qayd qilaman, RoE ga koʻra harakat qilaman va kritik boʻlgani uchun mijozga darhol xabar beraman', 'Parolni oʻzgartirib qoʻyaman', 'Faylni oʻchirib tashlayman'], ru: ['Сразу войду в БД и выгружу все таблицы', 'Зафиксирую находку с доказательством, действую по RoE и сразу сообщаю заказчику, так как это критично', 'Сменю пароль', 'Удалю файл'] },
          why: { uz: 'Kritik topilmalar odatda darhol xabar qilinadi; tizimni oʻzgartirish pentester vazifasi emas.', ru: 'О критичных находках обычно сообщают сразу; менять систему - не задача пентестера.' } },
        { skill: 'reporting', answer: 3,
          q: { uz: 'Hisobotdagi tavsiyalardan qaysi biri eng toʻliq?', ru: 'Какая рекомендация в отчёте самая полная?' },
          options: { uz: ['"Serverni xavfsizroq qiling"', '"FTP ni oʻchiring"', '"Firewall oʻrnating"', '"Anonim FTP ni oʻchiring, vsftpd ni yangilang, MB parolini almashtiring, 3306 ni faqat ilova serveriga oching"'], ru: ['«Сделайте сервер безопаснее»', '«Отключите FTP»', '«Поставьте фаервол»', '«Отключите анонимный FTP, обновите vsftpd, смените пароль БД, откройте 3306 только для сервера приложения»'] },
          why: { uz: 'Tavsiya aniq, bajariladigan va har bir sababni yopadigan boʻlishi kerak.', ru: 'Рекомендация должна быть конкретной, выполнимой и закрывать каждую причину.' } },
      ],
    },
  ],
  task: {
    slug: 'pt-plaintext-services',
    entry: 'solve',
    title: { uz: 'Shifrlanmagan xizmatlar', ru: 'Нешифрованные сервисы' },
    statement: {
      uz: `\`solve(lines)\` funksiyasini yozing. Har bir qator nmap natijasi: \`"<port>/<proto> <holat> <xizmat>"\`, masalan \`"21/tcp open ftp"\`.

Holati \`open\` boʻlgan va xizmati maʼlumotni **ochiq matnda** uzatadiganlar (\`ftp\`, \`telnet\`, \`http\`, \`pop3\`, \`imap\`) portlari roʻyxatini **son sifatida**, oʻsish tartibida qaytaring. Takrorlangan portni bir marta qaytaring.`,
      ru: `Напишите функцию \`solve(lines)\`. Каждая строка - результат nmap: \`"<порт>/<протокол> <состояние> <сервис>"\`, например \`"21/tcp open ftp"\`.

Верните **числами**, по возрастанию, порты в состоянии \`open\`, чей сервис передаёт данные **открытым текстом** (\`ftp\`, \`telnet\`, \`http\`, \`pop3\`, \`imap\`). Повторяющийся порт верните один раз.`,
    },
    constraints: { uz: '`0 ≤ len(lines) ≤ 1000`; qatorlar toʻgʻri formatda.', ru: '`0 ≤ len(lines) ≤ 1000`; строки в правильном формате.' },
    starter: 'def solve(lines):\n    pass',
    reference: `def solve(lines):
    plain = {'ftp', 'telnet', 'http', 'pop3', 'imap'}
    found = set()
    for line in lines:
        parts = line.split()
        if len(parts) < 3:
            continue
        port, state, service = parts[0], parts[1], parts[2]
        if state == 'open' and service in plain:
            found.add(int(port.split('/')[0]))
    return sorted(found)`,
    tests: [
      { args: [['21/tcp open ftp', '22/tcp open ssh', '80/tcp open http', '443/tcp open https']], expected: [21, 80], hidden: false },
      { args: [[]], expected: [], hidden: false },
      { args: [['23/tcp filtered telnet', '110/tcp open pop3', '143/tcp closed imap']], expected: [110], hidden: true },
      { args: [['8080/tcp open http', '80/tcp open http', '8080/tcp open http']], expected: [80, 8080], hidden: true },
      { args: [['3306/tcp open mysql', '445/tcp open microsoft-ds']], expected: [], hidden: true },
      { args: [['993/tcp open imaps', '143/tcp open imap', '23/tcp open telnet']], expected: [23, 143], hidden: true },
    ],
  },
};

/* ── Security engineer ──────────────────────────────────────────────────── */
const SECENG = {
  slug: 'security-engineer',
  icon: 'key',
  level: 'middle',
  needs_review: true,
  title: { uz: 'Xavfsizlik muhandisi', ru: 'Инженер по безопасности' },
  summary: {
    uz: 'Xavfsiz arxitektura, parol va sessiyalar, HTTP himoyasi va bulutdagi sirlar bilan ishlash.',
    ru: 'Безопасная архитектура, пароли и сессии, защита HTTP и работа с секретами в облаке.',
  },
  skills: ['web', 'crypto', 'auth', 'cloud', 'hardening', 'python'],
  brief: [
    {
      title: { uz: 'Xavfsiz loyihalash tamoyillari', ru: 'Принципы безопасного проектирования' },
      body: {
        uz: `- **Eng kam imtiyoz** - har bir xizmat va odam faqat oʻz ishiga kerakli huquqqa ega.
- **Chuqur himoya (defense in depth)** - bitta himoya buzilsa, keyingisi ishlaydi: WAF + parametrlangan soʻrov + MB foydalanuvchisining cheklangan huquqi.
- **Xavfsiz standart** - yangi resurs yopiq holda yaratiladi; ochish - ongli qaror.
- **Tahdidlarni modellashtirish** - qurishdan oldin "nima notoʻgʻri ketishi mumkin?" deb soʻrang. **STRIDE**: Spoofing (soxtalashtirish), Tampering (oʻzgartirish), Repudiation (inkor), Information disclosure (oshkor qilish), Denial of service, Elevation of privilege.

Muhandis "xavfsizmi?" deb emas, "qaysi xavfni qabul qilyapmiz va nima uchun?" deb soʻraydi.`,
        ru: `- **Минимальные привилегии** - каждый сервис и человек имеет только нужные для работы права.
- **Эшелонированная защита** - если пала одна защита, работает следующая: WAF + параметризованный запрос + ограниченные права пользователя БД.
- **Безопасность по умолчанию** - новый ресурс создаётся закрытым; открыть - осознанное решение.
- **Моделирование угроз** - до разработки спросите «что может пойти не так?». **STRIDE**: Spoofing (подмена), Tampering (изменение), Repudiation (отказ от действий), Information disclosure (раскрытие), Denial of service, Elevation of privilege.

Инженер спрашивает не «безопасно ли?», а «какой риск мы принимаем и почему?».`,
      },
    },
    {
      title: { uz: 'Parollar va sessiyalar', ru: 'Пароли и сессии' },
      body: {
        uz: `**Parollar** hech qachon shifrlanmaydi va oddiy xesh (MD5, SHA-256) bilan saqlanmaydi. Toʻgʻri yoʻl - **sekin, tuzli** xesh: **bcrypt**, **scrypt** yoki **Argon2id**.

- **Tuz (salt)** - har bir foydalanuvchiga tasodifiy qiymat; bir xil parollar har xil xesh beradi va oldindan hisoblangan jadvallar (rainbow tables) ishlamaydi.
- **Sekinlik** - bitta tekshiruv ~100 ms; foydalanuvchi sezmaydi, lekin milliardlab tanlash amalga oshmaydi.

**Sessiya** cookiesi uchun bayroqlar:

| Bayroq | Nima beradi |
|---|---|
| \`HttpOnly\` | JavaScript cookie ni oʻqiy olmaydi - XSS token oʻgʻirlay olmaydi |
| \`Secure\` | Faqat HTTPS orqali yuboriladi |
| \`SameSite=Lax/Strict\` | Begona saytdan yuborilgan soʻrovlarda cookie ketmaydi - CSRF ga qarshi |

Tokenni \`localStorage\` da saqlash XSS paytida uni toʻliq oshkor qiladi.`,
        ru: `**Пароли** никогда не шифруют и не хранят простым хешем (MD5, SHA-256). Правильно - **медленный хеш с солью**: **bcrypt**, **scrypt** или **Argon2id**.

- **Соль** - случайное значение для каждого пользователя; одинаковые пароли дают разные хеши, а заранее посчитанные таблицы (rainbow tables) не работают.
- **Медленность** - одна проверка ~100 мс; пользователь не заметит, а перебор миллиардов станет невозможен.

Флаги для **cookie сессии**:

| Флаг | Что даёт |
|---|---|
| \`HttpOnly\` | JavaScript не читает cookie - XSS не украдёт токен |
| \`Secure\` | Отправляется только по HTTPS |
| \`SameSite=Lax/Strict\` | Cookie не уходит в запросах с чужих сайтов - защита от CSRF |

Хранение токена в \`localStorage\` полностью раскрывает его при XSS.`,
      },
    },
    {
      title: { uz: 'HTTP xavfsizlik sarlavhalari', ru: 'Заголовки безопасности HTTP' },
      body: {
        uz: `Brauzerga "bu sahifani qanday himoya qil" deb aytadigan sarlavhalar:

- **Strict-Transport-Security (HSTS)** - brauzer saytga faqat HTTPS orqali kiradi, SSL-stripping hujumini yopadi.
- **Content-Security-Policy (CSP)** - qaysi manbadan skript yuklash mumkinligini belgilaydi; XSS ning eng kuchli qoʻshimcha himoyasi.
- **X-Content-Type-Options: nosniff** - brauzer fayl turini "taxmin qilmaydi".
- **X-Frame-Options / frame-ancestors** - sahifani begona \`iframe\` ga joylashni taqiqlaydi (clickjacking).

Sarlavhalar kodni tuzatishning oʻrnini bosmaydi - ular xato qolib ketganda zararni kamaytiradi.`,
        ru: `Заголовки, которые говорят браузеру, «как защищать страницу»:

- **Strict-Transport-Security (HSTS)** - браузер ходит на сайт только по HTTPS, закрывает атаку SSL-stripping.
- **Content-Security-Policy (CSP)** - откуда можно загружать скрипты; самая сильная дополнительная защита от XSS.
- **X-Content-Type-Options: nosniff** - браузер не «угадывает» тип файла.
- **X-Frame-Options / frame-ancestors** - запрещает вставлять страницу в чужой \`iframe\` (clickjacking).

Заголовки не заменяют исправление кода - они уменьшают ущерб, если ошибка осталась.`,
      },
    },
    {
      title: { uz: 'Bulut va sirlar', ru: 'Облако и секреты' },
      body: {
        uz: `**Umumiy masʼuliyat modeli**: provayder bulutning *oʻzi* uchun javob beradi (maʼlumot markazlari, gipervizor), mijoz esa bulutdagi *narsalar* uchun: IAM sozlamalari, ochiq bucketlar, VM dagi OT yangilanishlari, tarmoq qoidalari.

Sirlar (API kalitlar, parollar) bilan ishlash qoidalari:

1. Sir hech qachon kodda yoki git da saqlanmaydi - **secrets manager** yoki muhit oʻzgaruvchilari.
2. Sir git ga tushib qolsa - **darhol bekor qiling (rotate)**. Commitni oʻchirish yetmaydi: tarix nusxalangan boʻlishi mumkin, botlar ochiq repolarni soniyalar ichida skanerlaydi.
3. Keyin audit loglarini (masalan, CloudTrail) tekshiring: kalit bilan nima qilingan.
4. Takrorlanmasligi uchun: pre-commit va CI da **secret scanning**.

IAM siyosatlarida \`"Action": "*"\` va \`"Resource": "*"\` - qizil bayroq.`,
        ru: `**Модель разделённой ответственности**: провайдер отвечает за *само* облако (дата-центры, гипервизор), клиент - за то, что *в* облаке: настройки IAM, открытые бакеты, обновления ОС на ВМ, сетевые правила.

Правила работы с секретами (API-ключи, пароли):

1. Секрет никогда не хранится в коде или git - только **secrets manager** или переменные окружения.
2. Если секрет попал в git - **немедленно отзовите (ротируйте)** его. Удаления коммита мало: история могла быть скопирована, боты сканируют публичные репо за секунды.
3. Затем проверьте журналы аудита (например, CloudTrail): что делали этим ключом.
4. Чтобы не повторилось: **secret scanning** в pre-commit и CI.

В IAM-политиках \`"Action": "*"\` и \`"Resource": "*"\` - красный флаг.`,
      },
    },
  ],
  concepts: [
    { id: 'se-c1', skill: 'crypto', answer: 2,
      q: { uz: 'Foydalanuvchi parollarini qanday saqlash kerak?', ru: 'Как правильно хранить пароли пользователей?' },
      options: { uz: ['AES bilan shifrlab', 'SHA-256 xeshi sifatida', 'bcrypt yoki Argon2 kabi sekin, tuzli xesh bilan', 'Base64 da'], ru: ['Зашифровать AES', 'Как хеш SHA-256', 'Медленным хешем с солью: bcrypt или Argon2', 'В Base64'] },
      why: { uz: 'Shifrni ochish mumkin, SHA-256 juda tez - GPU sekundiga milliardlab tanlaydi.', ru: 'Шифр можно расшифровать, SHA-256 слишком быстрый - GPU перебирает миллиарды в секунду.' } },
    { id: 'se-c2', skill: 'auth', answer: 0,
      q: { uz: 'Cookie dagi `HttpOnly` bayrogʻi nimadan himoya qiladi?', ru: 'От чего защищает флаг `HttpOnly` у cookie?' },
      options: { uz: ['XSS orqali JavaScript cookie ni oʻqib olishidan', 'Tarmoqda ushlab olinishidan', 'CSRF dan toʻliq', 'Cookie muddati tugashidan'], ru: ['От чтения cookie JavaScript-ом при XSS', 'От перехвата в сети', 'Полностью от CSRF', 'От истечения срока cookie'] },
      why: { uz: 'Tarmoqdan himoya - `Secure` (HTTPS), CSRF ga qarshi - `SameSite`.', ru: 'От сети защищает `Secure` (HTTPS), от CSRF - `SameSite`.' } },
    { id: 'se-c3', skill: 'hardening', answer: 1,
      q: { uz: 'HSTS sarlavhasi nima qiladi?', ru: 'Что делает заголовок HSTS?' },
      options: { uz: ['Skriptlarni bloklaydi', 'Brauzerni saytga faqat HTTPS orqali ulanishga majbur qiladi', 'Parollarni xeshlaydi', 'Iframe ni taqiqlaydi'], ru: ['Блокирует скрипты', 'Заставляет браузер подключаться к сайту только по HTTPS', 'Хеширует пароли', 'Запрещает iframe'] },
      why: { uz: 'HTTP ga tushirish (SSL-stripping) hujumini yopadi.', ru: 'Закрывает атаку понижения до HTTP (SSL-stripping).' } },
    { id: 'se-c4', skill: 'cloud', answer: 3,
      q: { uz: 'IaaS da (masalan, EC2) VM operatsion tizimini kim yangilaydi?', ru: 'Кто обновляет ОС виртуальной машины в IaaS (например, EC2)?' },
      options: { uz: ['Bulut provayderi', 'Hech kim, yangilanish kerak emas', 'Gipervizor avtomatik', 'Mijoz'], ru: ['Облачный провайдер', 'Никто, обновлять не нужно', 'Гипервизор автоматически', 'Клиент'] },
      why: { uz: 'IaaS da VM ichidagi hamma narsa - mijoz masʼuliyati.', ru: 'В IaaS всё внутри ВМ - ответственность клиента.' } },
    { id: 'se-c5', skill: 'cloud', answer: 0,
      q: { uz: 'API kaliti ochiq GitHub repoga tushib qoldi. Birinchi qadam?', ru: 'API-ключ попал в публичный репозиторий GitHub. Первый шаг?' },
      options: { uz: ['Kalitni darhol bekor qilish va yangisini berish', 'Commitni oʻchirish', 'Repoini private qilish', 'Kutish - hech kim sezmaydi'], ru: ['Немедленно отозвать ключ и выпустить новый', 'Удалить коммит', 'Сделать репозиторий приватным', 'Подождать - никто не заметит'] },
      why: { uz: 'Botlar ochiq repolarni soniyalar ichida skanerlaydi; kalit allaqachon nusxalangan deb hisoblang.', ru: 'Боты сканируют публичные репо за секунды; считайте, что ключ уже скопирован.' } },
    { id: 'se-c6', skill: 'web', answer: 2,
      q: { uz: 'Content-Security-Policy asosan qaysi hujumga qarshi?', ru: 'От какой атаки в первую очередь защищает Content-Security-Policy?' },
      options: { uz: ['SQL injection', 'Brute force', 'XSS', 'DDoS'], ru: ['SQL injection', 'Brute force', 'XSS', 'DDoS'] },
      why: { uz: 'CSP ruxsat etilmagan manbadan skript bajarilishini toʻxtatadi.', ru: 'CSP не даёт выполнять скрипты из неразрешённых источников.' } },
    { id: 'se-c7', skill: 'cloud', answer: 1,
      q: { uz: 'Qaysi IAM siyosati "eng kam imtiyoz" ga mos?', ru: 'Какая IAM-политика соответствует «минимальным привилегиям»?' },
      options: { uz: ['`s3:*` hamma bucketlarga', 'Faqat `s3:GetObject` bitta `reports` bucketiga', '`AdministratorAccess` - qulay', '`*:*` vaqtincha'], ru: ['`s3:*` на все бакеты', 'Только `s3:GetObject` на один бакет `reports`', '`AdministratorAccess` - удобно', '`*:*` временно'] },
      why: { uz: 'Faqat kerakli amal, faqat kerakli resurs.', ru: 'Только нужное действие, только на нужный ресурс.' } },
    { id: 'se-c8', skill: 'crypto', answer: 3,
      q: { uz: 'Parol xeshidagi "tuz" (salt) nima uchun kerak?', ru: 'Зачем нужна «соль» в хеше пароля?' },
      options: { uz: ['Xeshni qisqartirish uchun', 'Parolni keyin ochish uchun', 'Xeshlashni tezlashtirish uchun', 'Bir xil parollar har xil xesh berishi va rainbow table ishlamasligi uchun'], ru: ['Чтобы укоротить хеш', 'Чтобы потом расшифровать пароль', 'Чтобы ускорить хеширование', 'Чтобы одинаковые пароли давали разные хеши и rainbow tables не работали'] },
      why: { uz: 'Tuz sir emas - u xesh yonida saqlanadi; uning vazifasi - noyoblik.', ru: 'Соль не секрет - её хранят рядом с хешем; её задача - уникальность.' } },
    { id: 'se-c9', skill: 'web', answer: 0,
      q: { uz: 'CSRF ga qarshi samarali himoya?', ru: 'Эффективная защита от CSRF?' },
      options: { uz: ['SameSite cookie va anti-CSRF token', 'Uzunroq parollar', 'HTTPS ning oʻzi', 'Xato xabarlarini yashirish'], ru: ['SameSite cookie и anti-CSRF токен', 'Более длинные пароли', 'Только HTTPS', 'Скрытие сообщений об ошибках'] },
      why: { uz: 'CSRF brauzer cookie ni avtomatik yuborishidan foydalanadi; SameSite va token buni toʻxtatadi.', ru: 'CSRF использует автоматическую отправку cookie; SameSite и токен это останавливают.' } },
    { id: 'se-c10', skill: 'hardening', answer: 2,
      q: { uz: 'STRIDE dagi "S" nimani bildiradi?', ru: 'Что означает «S» в STRIDE?' },
      options: { uz: ['SQL', 'Session', 'Spoofing - oʻzini boshqa shaxs deb koʻrsatish', 'Scanning'], ru: ['SQL', 'Session', 'Spoofing - выдача себя за другого', 'Scanning'] },
      why: { uz: 'Spoofing ga qarshi - autentifikatsiya.', ru: 'Против spoofing защищает аутентификация.' } },
  ],
  scenarios: [
    {
      id: 'se-s1',
      title: { uz: 'Oqib chiqqan bulut kaliti', ru: 'Утёкший облачный ключ' },
      context: {
        uz: `GitHub secret scanning ogohlantirishi: 2 soat oldin ochiq \`marketing-site\` reposiga commit qilingan:

\`\`\`
# deploy.sh
export AWS_ACCESS_KEY_ID=AKIA...7QX2
export AWS_SECRET_ACCESS_KEY=****************
\`\`\`

Bu kalit \`deploy-bot\` IAM foydalanuvchisiga tegishli va unda \`AdministratorAccess\` siyosati bor.`,
        ru: `Предупреждение GitHub secret scanning: 2 часа назад в публичный репозиторий \`marketing-site\` закоммичено:

\`\`\`
# deploy.sh
export AWS_ACCESS_KEY_ID=AKIA...7QX2
export AWS_SECRET_ACCESS_KEY=****************
\`\`\`

Ключ принадлежит IAM-пользователю \`deploy-bot\` с политикой \`AdministratorAccess\`.`,
      },
      steps: [
        { skill: 'cloud', answer: 1,
          q: { uz: 'Birinchi harakat?', ru: 'Первое действие?' },
          options: { uz: ['Commitni git tarixidan oʻchiraman', 'Kalitni darhol oʻchiraman (deactivate), deploy uchun yangisini beraman', 'Muallifga xat yozaman', 'Repoini private qilaman'], ru: ['Удалю коммит из истории git', 'Сразу деактивирую ключ и выпущу новый для деплоя', 'Напишу автору', 'Сделаю репо приватным'] },
          why: { uz: '2 soat - botlar uchun juda uzoq vaqt. Kalit ishlab turar ekan, xavf davom etadi.', ru: '2 часа - огромный срок для ботов. Пока ключ активен, риск продолжается.' } },
        { skill: 'cloud', answer: 3,
          q: { uz: 'Kalit oʻchirildi. Endi nimani tekshirasiz?', ru: 'Ключ отключён. Что проверите теперь?' },
          options: { uz: ['Hech narsa - xavf yopildi', 'Faqat repo ruxsatlarini', 'Saytning ishlashini', 'CloudTrail: shu kalit bilan 2 soat ichida qilingan barcha API chaqiruvlar, barcha regionlarda'], ru: ['Ничего - риск закрыт', 'Только права на репо', 'Работу сайта', 'CloudTrail: все API-вызовы этим ключом за 2 часа во всех регионах'] },
          why: { uz: 'Kalit oʻchirilgani hujumchi yaratgan narsalarni oʻchirmaydi.', ru: 'Отключение ключа не удаляет то, что успел создать атакующий.' } },
        { skill: 'cloud', answer: 0,
          q: { uz: 'CloudTrail da boshqa regionda 12 ta yangi katta EC2 instansiya va yangi IAM foydalanuvchi `support-admin` topildi. Nima qilasiz?', ru: 'В CloudTrail: в другом регионе 12 новых больших EC2 и новый IAM-пользователь `support-admin`. Что делаете?' },
          options: { uz: ['Hodisa sifatida eskalatsiya qilaman; instansiyalarni toʻxtataman (dalil uchun snapshot olib), support-admin va uning kalitlarini oʻchiraman, boshqa qolib ketish usullarini qidiraman', 'Instansiyalarni qoldiraman - ular foyda keltirishi mumkin', 'Faqat hisob-kitobni kuzataman', 'Faqat support-admin ni oʻchiraman'], ru: ['Эскалирую как инцидент; остановлю инстансы (сняв снапшоты для улик), удалю support-admin и его ключи, поищу другие способы закрепления', 'Оставлю инстансы - вдруг пригодятся', 'Только буду следить за счётом', 'Удалю только support-admin'] },
          why: { uz: 'Bu - kripto-mayning va qolib ketish (yangi admin). Toʻliq tozalash kerak.', ru: 'Это криптомайнинг и закрепление (новый админ). Нужна полная зачистка.' } },
        { skill: 'hardening', answer: 2,
          q: { uz: 'Takrorlanmasligi uchun eng muhim oʻzgarish?', ru: 'Самое важное изменение, чтобы не повторилось?' },
          options: { uz: ['Dasturchilarga eslatma yuborish', 'Barcha repolarni private qilish', 'Sirlarni secrets manager ga koʻchirish, CI/pre-commit da secret scanning, deploy-bot huquqini faqat kerakli amallarga cheklash', 'AWS dan voz kechish'], ru: ['Разослать разработчикам напоминание', 'Сделать все репо приватными', 'Перенести секреты в secrets manager, secret scanning в CI/pre-commit, сузить права deploy-bot до нужных действий', 'Отказаться от AWS'] },
          why: { uz: 'Texnik nazorat + eng kam imtiyoz: keyingi oqish boʻlsa ham zarar kichik boʻladi.', ru: 'Технический контроль + минимальные права: даже при следующей утечке ущерб будет мал.' } },
      ],
    },
    {
      id: 'se-s2',
      title: { uz: 'Login API ni koʻrib chiqish', ru: 'Ревью API входа' },
      context: {
        uz: `Jamoa yangi login API ni chiqarmoqchi. Dizayndan:

\`\`\`
users.password   = md5(password)
POST /login      → {"token": "<JWT>"}   (frontend uni localStorage ga yozadi)
POST /login      → urinishlar soni cheklanmagan
\`\`\`

Bazada allaqachon 40 000 foydalanuvchi bor.`,
        ru: `Команда хочет выпустить новый API входа. Из дизайна:

\`\`\`
users.password   = md5(password)
POST /login      → {"token": "<JWT>"}   (фронтенд пишет его в localStorage)
POST /login      → число попыток не ограничено
\`\`\`

В базе уже 40 000 пользователей.`,
      },
      steps: [
        { skill: 'crypto', answer: 3,
          q: { uz: 'Parol saqlashdagi muammo?', ru: 'В чём проблема хранения паролей?' },
          options: { uz: ['MD5 juda uzun', 'Muammo yoʻq, xesh qaytarib boʻlmaydi', 'MD5 shifrlash, xesh emas', 'MD5 tez va tuzsiz - oqish boʻlsa parollar tez tiklanadi; bcrypt/Argon2 kerak'], ru: ['MD5 слишком длинный', 'Проблемы нет, хеш необратим', 'MD5 - шифрование, а не хеш', 'MD5 быстрый и без соли - при утечке пароли быстро восстановят; нужен bcrypt/Argon2'] },
          why: { uz: 'Tez xesh + tuz yoʻq = rainbow table va GPU tanlash.', ru: 'Быстрый хеш + нет соли = rainbow tables и перебор на GPU.' } },
        { skill: 'auth', answer: 1,
          q: { uz: 'Tokenni localStorage da saqlash xavfi?', ru: 'Чем опасно хранить токен в localStorage?' },
          options: { uz: ['Token tezroq eskiradi', 'Har qanday XSS tokenni oʻqib, sessiyani oʻgʻirlaydi; HttpOnly cookie xavfsizroq', 'localStorage hajmi kichik', 'Mobil brauzerlar uni qoʻllamaydi'], ru: ['Токен быстрее устареет', 'Любая XSS прочитает токен и угонит сессию; HttpOnly cookie безопаснее', 'Мало места в localStorage', 'Мобильные браузеры его не поддерживают'] },
          why: { uz: 'localStorage JavaScript uchun toʻliq ochiq.', ru: 'localStorage полностью доступен JavaScript.' } },
        { skill: 'auth', answer: 0,
          q: { uz: 'Cheklanmagan login urinishlari qanday hujumga yoʻl ochadi va nima qilish kerak?', ru: 'К какой атаке ведут неограниченные попытки входа и что делать?' },
          options: { uz: ['Brute force va credential stuffing; rate limit, vaqtinchalik bloklash va MFA', 'XSS; CSP qoʻyish', 'SQL injection; parametrlar', 'Hech qanday, parol baribir xeshlangan'], ru: ['Brute force и credential stuffing; rate limit, временная блокировка и MFA', 'XSS; поставить CSP', 'SQL injection; параметры', 'Ни к какой, пароль ведь хеширован'] },
          why: { uz: 'Oqib chiqqan parol bazalari bilan avtomatik kirish - eng keng tarqalgan hujumlardan.', ru: 'Автоматический вход по утёкшим базам паролей - одна из самых частых атак.' } },
        { skill: 'crypto', answer: 2,
          q: { uz: '40 000 ta mavjud MD5 xeshni foydalanuvchilarni majburan parol almashtirmasdan qanday koʻchirasiz?', ru: 'Как перевести 40 000 существующих MD5-хешей, не заставляя всех менять пароль?' },
          options: { uz: ['Barcha MD5 larni tiklab, bcrypt qilaman', 'Hamma uchun MD5 ni qoldiraman', 'Hozir har birini bcrypt(md5) ga oʻraman, keyingi kirishda toza bcrypt(password) ga qayta xeshlayman', 'Hammaga yangi parol yuboraman'], ru: ['Восстановлю все MD5 и захеширую bcrypt', 'Оставлю MD5 для всех', 'Сейчас оберну каждый в bcrypt(md5), а при следующем входе перехеширую в чистый bcrypt(password)', 'Разошлю всем новые пароли'] },
          why: { uz: 'Oʻrash darhol himoya beradi, qayta xeshlash esa asta-sekin toʻliq migratsiya qiladi.', ru: 'Обёртка защищает сразу, а перехеширование постепенно завершает миграцию.' } },
      ],
    },
  ],
  task: {
    slug: 'se-missing-headers',
    entry: 'solve',
    title: { uz: 'Yetishmayotgan sarlavhalar', ru: 'Недостающие заголовки' },
    statement: {
      uz: `\`solve(headers)\` funksiyasini yozing. \`headers\` - HTTP javob sarlavhalari lugʻati (\`dict\`); kalitlarning harf registri har xil boʻlishi mumkin.

Quyidagi roʻyxatdan **yoʻq** sarlavhalarni **aynan shu tartibda va shu yozilishda** qaytaring:

\`Content-Security-Policy\`, \`Strict-Transport-Security\`, \`X-Content-Type-Options\`, \`X-Frame-Options\`.

Qiymati boʻsh satr yoki faqat boʻshliq boʻlgan sarlavha ham yoʻq deb hisoblanadi.`,
      ru: `Напишите функцию \`solve(headers)\`. \`headers\` - словарь (\`dict\`) заголовков HTTP-ответа; регистр ключей может быть любым.

Верните **отсутствующие** заголовки из списка **именно в этом порядке и написании**:

\`Content-Security-Policy\`, \`Strict-Transport-Security\`, \`X-Content-Type-Options\`, \`X-Frame-Options\`.

Заголовок с пустым значением или только пробелами тоже считается отсутствующим.`,
    },
    constraints: { uz: '`0 ≤ len(headers) ≤ 100`; qiymatlar satr.', ru: '`0 ≤ len(headers) ≤ 100`; значения - строки.' },
    starter: 'def solve(headers):\n    pass',
    reference: `def solve(headers):
    required = ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options']
    present = {k.lower() for k, v in headers.items() if str(v).strip()}
    return [h for h in required if h.lower() not in present]`,
    tests: [
      { args: [{ 'Content-Type': 'text/html', 'X-Frame-Options': 'DENY' }], expected: ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options'], hidden: false },
      { args: [{}], expected: ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options'], hidden: false },
      { args: [{ 'content-security-policy': "default-src 'self'", 'strict-transport-security': 'max-age=31536000', 'x-content-type-options': 'nosniff', 'x-frame-options': 'SAMEORIGIN' }], expected: [], hidden: true },
      { args: [{ 'STRICT-TRANSPORT-SECURITY': 'max-age=63072000', 'X-Content-Type-Options': '   ' }], expected: ['Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options'], hidden: true },
      { args: [{ 'Server': 'nginx', 'Content-Security-Policy': '' }], expected: ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options'], hidden: true },
      { args: [{ 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "frame-ancestors 'none'" }], expected: ['Strict-Transport-Security', 'X-Content-Type-Options'], hidden: true },
    ],
  },
};

/* Round shape shared by every role. Minutes are per round. */
const FORMAT = [
  { kind: 'concepts', minutes: 8, pick: 6 },
  { kind: 'scenario', minutes: 10 },
  { kind: 'coding', minutes: 15 },
];

const ROLES = [SOC, PENTEST, SECENG];

module.exports = { ROLES, SKILLS, FORMAT };
