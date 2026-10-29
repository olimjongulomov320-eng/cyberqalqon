/* AUTO-GENERATED from reference solutions — see backend/test/challenges.test.js.
 * Hand edits to `expected` will be caught by that test. All text is a DRAFT
 * (needs_review) awaiting a native-speaker pass: see CONTENT_REVIEW.md. */
module.exports = [
 {
  "slug": "sum-of-evens",
  "difficulty": "easy",
  "points": 10,
  "tags": [
   "lists",
   "loops"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-control-flow",
  "needs_review": true,
  "title": {
   "uz": "Juft sonlar yig‘indisi",
   "ru": "Сумма чётных чисел"
  },
  "statement": {
   "uz": "`solve(nums)` funksiyasini yozing: `nums` ro‘yxatidagi **juft** sonlar yig‘indisini qaytaring. Juft son bo‘lmasa — `0`.",
   "ru": "Напишите функцию `solve(nums)`: верните сумму **чётных** чисел списка `nums`. Если чётных нет — `0`."
  },
  "constraints": {
   "uz": "`0 ≤ len(nums) ≤ 1000`; sonlar butun.",
   "ru": "`0 ≤ len(nums) ≤ 1000`; числа целые."
  },
  "starter": "def solve(nums):\n    pass",
  "reference": "def solve(nums):\n    return sum(n for n in nums if n % 2 == 0)",
  "examples": [
   {
    "args": [
     [
      1,
      2,
      3,
      4
     ]
    ],
    "expected": 6
   },
   {
    "args": [
     []
    ],
    "expected": 0
   }
  ],
  "tests": [
   {
    "args": [
     [
      1,
      2,
      3,
      4
     ]
    ],
    "expected": 6,
    "hidden": false
   },
   {
    "args": [
     []
    ],
    "expected": 0,
    "hidden": false
   },
   {
    "args": [
     [
      2,
      4,
      6
     ]
    ],
    "expected": 12,
    "hidden": true
   },
   {
    "args": [
     [
      1,
      3,
      5
     ]
    ],
    "expected": 0,
    "hidden": true
   },
   {
    "args": [
     [
      -2,
      -3,
      10
     ]
    ],
    "expected": 8,
    "hidden": true
   },
   {
    "args": [
     [
      0
     ]
    ],
    "expected": 0,
    "hidden": true
   }
  ]
 },
 {
  "slug": "reverse-string",
  "difficulty": "easy",
  "points": 10,
  "tags": [
   "strings"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-basics",
  "needs_review": true,
  "title": {
   "uz": "Satrni teskari qilish",
   "ru": "Разверните строку"
  },
  "statement": {
   "uz": "`solve(s)` satr `s` ni teskari tartibda qaytarsin.",
   "ru": "Функция `solve(s)` должна вернуть строку `s` в обратном порядке."
  },
  "constraints": {
   "uz": "`0 ≤ len(s) ≤ 1000`.",
   "ru": "`0 ≤ len(s) ≤ 1000`."
  },
  "starter": "def solve(s):\n    pass",
  "reference": "def solve(s):\n    return s[::-1]",
  "examples": [
   {
    "args": [
     "abc"
    ],
    "expected": "cba"
   },
   {
    "args": [
     "Qalqon"
    ],
    "expected": "noqlaQ"
   }
  ],
  "tests": [
   {
    "args": [
     "abc"
    ],
    "expected": "cba",
    "hidden": false
   },
   {
    "args": [
     "Qalqon"
    ],
    "expected": "noqlaQ",
    "hidden": false
   },
   {
    "args": [
     ""
    ],
    "expected": "",
    "hidden": true
   },
   {
    "args": [
     "a"
    ],
    "expected": "a",
    "hidden": true
   },
   {
    "args": [
     "hello world"
    ],
    "expected": "dlrow olleh",
    "hidden": true
   },
   {
    "args": [
     "12321"
    ],
    "expected": "12321",
    "hidden": true
   }
  ]
 },
 {
  "slug": "is-palindrome",
  "difficulty": "easy",
  "points": 10,
  "tags": [
   "strings"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-basics",
  "needs_review": true,
  "title": {
   "uz": "Palindrommi?",
   "ru": "Палиндром ли?"
  },
  "statement": {
   "uz": "`solve(s)` — `s` palindrom bo‘lsa `True`, aks holda `False` qaytarsin. Katta-kichik harf farqi hisobga olinmasin, bo‘shliqlar e’tiborsiz.",
   "ru": "`solve(s)` возвращает `True`, если `s` — палиндром, иначе `False`. Регистр не важен, пробелы игнорируются."
  },
  "constraints": {
   "uz": "`0 ≤ len(s) ≤ 1000`.",
   "ru": "`0 ≤ len(s) ≤ 1000`."
  },
  "starter": "def solve(s):\n    pass",
  "reference": "def solve(s):\n    t = ''.join(s.lower().split())\n    return t == t[::-1]",
  "examples": [
   {
    "args": [
     "Level"
    ],
    "expected": true
   },
   {
    "args": [
     "abc"
    ],
    "expected": false
   }
  ],
  "tests": [
   {
    "args": [
     "Level"
    ],
    "expected": true,
    "hidden": false
   },
   {
    "args": [
     "abc"
    ],
    "expected": false,
    "hidden": false
   },
   {
    "args": [
     ""
    ],
    "expected": true,
    "hidden": true
   },
   {
    "args": [
     "A man a plan a canal Panama"
    ],
    "expected": true,
    "hidden": true
   },
   {
    "args": [
     "ab"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "Race car"
    ],
    "expected": true,
    "hidden": true
   }
  ]
 },
 {
  "slug": "count-vowels",
  "difficulty": "easy",
  "points": 10,
  "tags": [
   "strings",
   "loops"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-control-flow",
  "needs_review": true,
  "title": {
   "uz": "Unlilar soni",
   "ru": "Количество гласных"
  },
  "statement": {
   "uz": "`solve(s)` satrdagi ingliz unli harflari (`a, e, i, o, u`, katta-kichik) sonini qaytarsin.",
   "ru": "`solve(s)` возвращает количество английских гласных (`a, e, i, o, u`, любой регистр) в строке."
  },
  "constraints": {
   "uz": "`0 ≤ len(s) ≤ 1000`.",
   "ru": "`0 ≤ len(s) ≤ 1000`."
  },
  "starter": "def solve(s):\n    pass",
  "reference": "def solve(s):\n    return sum(1 for c in s.lower() if c in 'aeiou')",
  "examples": [
   {
    "args": [
     "Hello"
    ],
    "expected": 2
   },
   {
    "args": [
     "rhythm"
    ],
    "expected": 0
   }
  ],
  "tests": [
   {
    "args": [
     "Hello"
    ],
    "expected": 2,
    "hidden": false
   },
   {
    "args": [
     "rhythm"
    ],
    "expected": 0,
    "hidden": false
   },
   {
    "args": [
     ""
    ],
    "expected": 0,
    "hidden": true
   },
   {
    "args": [
     "AEIOU"
    ],
    "expected": 5,
    "hidden": true
   },
   {
    "args": [
     "CyberQalqon"
    ],
    "expected": 3,
    "hidden": true
   },
   {
    "args": [
     "xyz"
    ],
    "expected": 0,
    "hidden": true
   }
  ]
 },
 {
  "slug": "mask-card-number",
  "difficulty": "easy",
  "points": 15,
  "tags": [
   "strings",
   "privacy"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-basics",
  "needs_review": true,
  "title": {
   "uz": "Karta raqamini yashirish",
   "ru": "Скрытие номера карты"
  },
  "statement": {
   "uz": "Maxfiylik uchun karta raqamining oxirgi 4 raqamidan boshqasini `*` bilan almashtiring. `solve(card)` shunday satr qaytarsin (uzunlik o‘zgarmaydi).",
   "ru": "Для приватности замените все цифры номера карты, кроме последних 4, на `*`. `solve(card)` возвращает такую строку (длина не меняется)."
  },
  "constraints": {
   "uz": "`4 ≤ len(card) ≤ 19`; faqat raqamlar.",
   "ru": "`4 ≤ len(card) ≤ 19`; только цифры."
  },
  "starter": "def solve(card):\n    pass",
  "reference": "def solve(card):\n    return '*' * (len(card) - 4) + card[-4:]",
  "examples": [
   {
    "args": [
     "1234567812345678"
    ],
    "expected": "************5678"
   }
  ],
  "tests": [
   {
    "args": [
     "1234567812345678"
    ],
    "expected": "************5678",
    "hidden": false
   },
   {
    "args": [
     "1234"
    ],
    "expected": "1234",
    "hidden": false
   },
   {
    "args": [
     "12345"
    ],
    "expected": "*2345",
    "hidden": true
   },
   {
    "args": [
     "4000123412341234999"
    ],
    "expected": "***************4999",
    "hidden": true
   },
   {
    "args": [
     "9876543210"
    ],
    "expected": "******3210",
    "hidden": true
   }
  ]
 },
 {
  "slug": "strong-password",
  "difficulty": "medium",
  "points": 20,
  "tags": [
   "strings",
   "security"
  ],
  "language": "python",
  "entry": "solve",
  "module": "passwords-and-mfa",
  "needs_review": true,
  "title": {
   "uz": "Kuchli parol",
   "ru": "Надёжный пароль"
  },
  "statement": {
   "uz": "`solve(pw)` parol kuchli bo‘lsa `True` qaytarsin: kamida **8** belgi, kamida bitta **katta** harf, **kichik** harf, **raqam** va **belgi** (harf yoki raqam bo‘lmagan belgi).",
   "ru": "`solve(pw)` возвращает `True`, если пароль надёжный: не менее **8** символов, хотя бы одна **заглавная**, **строчная** буква, **цифра** и **символ** (не буква и не цифра)."
  },
  "constraints": {
   "uz": "`0 ≤ len(pw) ≤ 128`.",
   "ru": "`0 ≤ len(pw) ≤ 128`."
  },
  "starter": "def solve(pw):\n    pass",
  "reference": "def solve(pw):\n    return (len(pw) >= 8 and any(c.isupper() for c in pw) and any(c.islower() for c in pw)\n            and any(c.isdigit() for c in pw) and any(not c.isalnum() for c in pw))",
  "examples": [
   {
    "args": [
     "Abcdef1!"
    ],
    "expected": true
   },
   {
    "args": [
     "password"
    ],
    "expected": false
   }
  ],
  "tests": [
   {
    "args": [
     "Abcdef1!"
    ],
    "expected": true,
    "hidden": false
   },
   {
    "args": [
     "password"
    ],
    "expected": false,
    "hidden": false
   },
   {
    "args": [
     "Short1!"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "NOLOWER1!"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "nouppercase1!"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "NoDigits!!"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "NoSymbol123A"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "Str0ng&Secure"
    ],
    "expected": true,
    "hidden": true
   }
  ]
 },
 {
  "slug": "caesar-cipher",
  "difficulty": "medium",
  "points": 20,
  "tags": [
   "strings",
   "crypto"
  ],
  "language": "python",
  "entry": "solve",
  "module": "hashing-vs-encryption",
  "needs_review": true,
  "title": {
   "uz": "Sezar shifri",
   "ru": "Шифр Цезаря"
  },
  "statement": {
   "uz": "`solve(text, shift)` matndagi har bir ingliz harfini alifboda `shift` o‘rin oldinga suring (aylanma). Katta-kichik harf saqlansin, boshqa belgilar o‘zgarmasin. Manfiy `shift` ham bo‘lishi mumkin.",
   "ru": "`solve(text, shift)` сдвигает каждую английскую букву на `shift` позиций вперёд по алфавиту (по кругу). Регистр сохраняется, остальные символы не меняются. `shift` может быть отрицательным."
  },
  "constraints": {
   "uz": "`0 ≤ len(text) ≤ 500`; `-100 ≤ shift ≤ 100`.",
   "ru": "`0 ≤ len(text) ≤ 500`; `-100 ≤ shift ≤ 100`."
  },
  "starter": "def solve(text, shift):\n    pass",
  "reference": "def solve(text, shift):\n    out = []\n    for c in text:\n        if c.isascii() and c.isalpha():\n            base = ord('A') if c.isupper() else ord('a')\n            out.append(chr((ord(c) - base + shift) % 26 + base))\n        else:\n            out.append(c)\n    return ''.join(out)",
  "examples": [
   {
    "args": [
     "abc",
     1
    ],
    "expected": "bcd"
   },
   {
    "args": [
     "Hello, World!",
     3
    ],
    "expected": "Khoor, Zruog!"
   }
  ],
  "tests": [
   {
    "args": [
     "abc",
     1
    ],
    "expected": "bcd",
    "hidden": false
   },
   {
    "args": [
     "Hello, World!",
     3
    ],
    "expected": "Khoor, Zruog!",
    "hidden": false
   },
   {
    "args": [
     "xyz",
     3
    ],
    "expected": "abc",
    "hidden": true
   },
   {
    "args": [
     "Python 3",
     -5
    ],
    "expected": "Ktocji 3",
    "hidden": true
   },
   {
    "args": [
     "",
     10
    ],
    "expected": "",
    "hidden": true
   },
   {
    "args": [
     "ABC",
     26
    ],
    "expected": "ABC",
    "hidden": true
   },
   {
    "args": [
     "Attack at dawn",
     13
    ],
    "expected": "Nggnpx ng qnja",
    "hidden": true
   }
  ]
 },
 {
  "slug": "count-failed-logins",
  "difficulty": "medium",
  "points": 25,
  "tags": [
   "dicts",
   "logs",
   "security"
  ],
  "language": "python",
  "entry": "solve",
  "module": "logging-and-monitoring",
  "needs_review": true,
  "title": {
   "uz": "Muvaffaqiyatsiz kirishlar",
   "ru": "Неудачные входы"
  },
  "statement": {
   "uz": "Log qatorlari: `\"<sana> <STATUS> user=<ism> ip=<ip>\"`, STATUS `OK` yoki `FAIL`. `solve(lines)` har bir foydalanuvchi uchun `FAIL` qatorlari sonini lug‘at ko‘rinishida qaytarsin (faqat kamida bitta `FAIL` bo‘lganlar).",
   "ru": "Строки журнала: `\"<дата> <STATUS> user=<имя> ip=<ip>\"`, STATUS — `OK` или `FAIL`. `solve(lines)` возвращает словарь: для каждого пользователя число строк `FAIL` (только у кого есть хотя бы один `FAIL`)."
  },
  "constraints": {
   "uz": "`0 ≤ len(lines) ≤ 1000`.",
   "ru": "`0 ≤ len(lines) ≤ 1000`."
  },
  "starter": "def solve(lines):\n    pass",
  "reference": "def solve(lines):\n    counts = {}\n    for line in lines:\n        parts = line.split()\n        if parts[1] == 'FAIL':\n            user = parts[2].split('=', 1)[1]\n            counts[user] = counts.get(user, 0) + 1\n    return counts",
  "examples": [
   {
    "args": [
     [
      "2024-05-01 FAIL user=alice ip=10.0.0.5",
      "2024-05-01 OK user=bob ip=10.0.0.9"
     ]
    ],
    "expected": {
     "alice": 1
    }
   }
  ],
  "tests": [
   {
    "args": [
     [
      "2024-05-01 FAIL user=alice ip=10.0.0.5",
      "2024-05-01 OK user=bob ip=10.0.0.9"
     ]
    ],
    "expected": {
     "alice": 1
    },
    "hidden": false
   },
   {
    "args": [
     []
    ],
    "expected": {},
    "hidden": false
   },
   {
    "args": [
     [
      "2024-05-01 FAIL user=alice ip=10.0.0.5",
      "2024-05-02 FAIL user=alice ip=10.0.0.6",
      "2024-05-02 FAIL user=bob ip=10.0.0.7"
     ]
    ],
    "expected": {
     "alice": 2,
     "bob": 1
    },
    "hidden": true
   },
   {
    "args": [
     [
      "2024-05-03 OK user=carol ip=10.0.0.1"
     ]
    ],
    "expected": {},
    "hidden": true
   },
   {
    "args": [
     [
      "a FAIL user=x ip=1",
      "b FAIL user=y ip=2",
      "c FAIL user=x ip=3",
      "d OK user=y ip=4",
      "e FAIL user=x ip=5"
     ]
    ],
    "expected": {
     "x": 3,
     "y": 1
    },
    "hidden": true
   }
  ]
 },
 {
  "slug": "valid-ipv4",
  "difficulty": "medium",
  "points": 20,
  "tags": [
   "strings",
   "networking"
  ],
  "language": "python",
  "entry": "solve",
  "module": "ip-addresses",
  "needs_review": true,
  "title": {
   "uz": "To‘g‘ri IPv4",
   "ru": "Корректный IPv4"
  },
  "statement": {
   "uz": "`solve(s)` — `s` to‘g‘ri IPv4 manzil bo‘lsa `True`: aynan 4 ta nuqta bilan ajratilgan qism, har biri `0–255` oralig‘idagi butun son, **bosh nol yo‘q** (`\"0\"` mumkin, `\"01\"` mumkin emas).",
   "ru": "`solve(s)` возвращает `True`, если `s` — корректный IPv4: ровно 4 части через точку, каждая — целое `0–255` **без ведущих нулей** (`\"0\"` можно, `\"01\"` нельзя)."
  },
  "constraints": {
   "uz": "`0 ≤ len(s) ≤ 50`.",
   "ru": "`0 ≤ len(s) ≤ 50`."
  },
  "starter": "def solve(s):\n    pass",
  "reference": "def solve(s):\n    parts = s.split('.')\n    if len(parts) != 4:\n        return False\n    for p in parts:\n        if not p.isdigit() or (len(p) > 1 and p[0] == '0') or int(p) > 255:\n            return False\n    return True",
  "examples": [
   {
    "args": [
     "192.168.0.1"
    ],
    "expected": true
   },
   {
    "args": [
     "256.1.1.1"
    ],
    "expected": false
   }
  ],
  "tests": [
   {
    "args": [
     "192.168.0.1"
    ],
    "expected": true,
    "hidden": false
   },
   {
    "args": [
     "256.1.1.1"
    ],
    "expected": false,
    "hidden": false
   },
   {
    "args": [
     "0.0.0.0"
    ],
    "expected": true,
    "hidden": true
   },
   {
    "args": [
     "255.255.255.255"
    ],
    "expected": true,
    "hidden": true
   },
   {
    "args": [
     "1.2.3"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "1.2.3.4.5"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "01.2.3.4"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "a.b.c.d"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     ""
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "1..2.3"
    ],
    "expected": false,
    "hidden": true
   }
  ]
 },
 {
  "slug": "most-frequent-word",
  "difficulty": "medium",
  "points": 20,
  "tags": [
   "strings",
   "dicts"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-data-structures",
  "needs_review": true,
  "title": {
   "uz": "Eng ko‘p uchragan so‘z",
   "ru": "Самое частое слово"
  },
  "statement": {
   "uz": "`solve(text)` matndagi eng ko‘p uchragan so‘zni (kichik harfda) qaytarsin. So‘zlar bo‘shliq bilan ajratilgan. Tenglik bo‘lsa — **alifbo bo‘yicha birinchisi**. Bo‘sh matn uchun `\"\"`.",
   "ru": "`solve(text)` возвращает самое частое слово текста (в нижнем регистре). Слова разделены пробелами. При равенстве — **первое по алфавиту**. Для пустого текста — `\"\"`."
  },
  "constraints": {
   "uz": "`0 ≤ len(text) ≤ 2000`.",
   "ru": "`0 ≤ len(text) ≤ 2000`."
  },
  "starter": "def solve(text):\n    pass",
  "reference": "def solve(text):\n    words = text.lower().split()\n    if not words:\n        return ''\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    best = max(counts.values())\n    return sorted(w for w, c in counts.items() if c == best)[0]",
  "examples": [
   {
    "args": [
     "a b a c"
    ],
    "expected": "a"
   },
   {
    "args": [
     "x y"
    ],
    "expected": "x"
   }
  ],
  "tests": [
   {
    "args": [
     "a b a c"
    ],
    "expected": "a",
    "hidden": false
   },
   {
    "args": [
     "x y"
    ],
    "expected": "x",
    "hidden": false
   },
   {
    "args": [
     ""
    ],
    "expected": "",
    "hidden": true
   },
   {
    "args": [
     "Test test TEST one"
    ],
    "expected": "test",
    "hidden": true
   },
   {
    "args": [
     "b a b a"
    ],
    "expected": "a",
    "hidden": true
   },
   {
    "args": [
     "one"
    ],
    "expected": "one",
    "hidden": true
   }
  ]
 },
 {
  "slug": "balanced-brackets",
  "difficulty": "medium",
  "points": 25,
  "tags": [
   "strings",
   "stack"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-data-structures",
  "needs_review": true,
  "title": {
   "uz": "Muvozanatli qavslar",
   "ru": "Сбалансированные скобки"
  },
  "statement": {
   "uz": "`solve(s)` — `s` dagi `()`, `[]`, `{}` qavslar to‘g‘ri ochilib-yopilgan bo‘lsa `True`. Boshqa belgilar e’tiborsiz.",
   "ru": "`solve(s)` возвращает `True`, если скобки `()`, `[]`, `{}` в `s` правильно открыты и закрыты. Остальные символы игнорируются."
  },
  "constraints": {
   "uz": "`0 ≤ len(s) ≤ 1000`.",
   "ru": "`0 ≤ len(s) ≤ 1000`."
  },
  "starter": "def solve(s):\n    pass",
  "reference": "def solve(s):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for c in s:\n        if c in '([{':\n            stack.append(c)\n        elif c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n    return not stack",
  "examples": [
   {
    "args": [
     "([]{})"
    ],
    "expected": true
   },
   {
    "args": [
     "(]"
    ],
    "expected": false
   }
  ],
  "tests": [
   {
    "args": [
     "([]{})"
    ],
    "expected": true,
    "hidden": false
   },
   {
    "args": [
     "(]"
    ],
    "expected": false,
    "hidden": false
   },
   {
    "args": [
     ""
    ],
    "expected": true,
    "hidden": true
   },
   {
    "args": [
     "(("
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "a(b)c[d]{e}"
    ],
    "expected": true,
    "hidden": true
   },
   {
    "args": [
     "{[(])}"
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     ")("
    ],
    "expected": false,
    "hidden": true
   },
   {
    "args": [
     "{[()()]}"
    ],
    "expected": true,
    "hidden": true
   }
  ]
 },
 {
  "slug": "suspicious-ips",
  "difficulty": "hard",
  "points": 40,
  "tags": [
   "dicts",
   "logs",
   "security"
  ],
  "language": "python",
  "entry": "solve",
  "module": "incident-response",
  "needs_review": true,
  "title": {
   "uz": "Shubhali IP manzillar",
   "ru": "Подозрительные IP-адреса"
  },
  "statement": {
   "uz": "Log qatorlari `\"<sana> <STATUS> user=<ism> ip=<ip>\"` ko‘rinishida. `solve(lines, limit)` **kamida `limit` marta** `FAIL` bo‘lgan IP manzillarni ro‘yxat qilib, **ko‘p urinishdan kamga** (tenglikda IP bo‘yicha o‘sish tartibida) tartiblab, `(ip, soni)` juftliklari bilan qaytarsin.",
   "ru": "Строки журнала: `\"<дата> <STATUS> user=<имя> ip=<ip>\"`. `solve(lines, limit)` возвращает список пар `(ip, число)` для IP-адресов с **не менее `limit`** строк `FAIL`, отсортированный **по убыванию числа** (при равенстве — по IP по возрастанию)."
  },
  "constraints": {
   "uz": "`0 ≤ len(lines) ≤ 2000`; `1 ≤ limit ≤ 100`.",
   "ru": "`0 ≤ len(lines) ≤ 2000`; `1 ≤ limit ≤ 100`."
  },
  "starter": "def solve(lines, limit):\n    pass",
  "reference": "def solve(lines, limit):\n    counts = {}\n    for line in lines:\n        parts = line.split()\n        if parts[1] == 'FAIL':\n            ip = parts[3].split('=', 1)[1]\n            counts[ip] = counts.get(ip, 0) + 1\n    hits = [(ip, n) for ip, n in counts.items() if n >= limit]\n    hits.sort(key=lambda t: (-t[1], t[0]))\n    return hits",
  "examples": [
   {
    "args": [
     [
      "d FAIL user=a ip=9.9.9.9",
      "d FAIL user=b ip=9.9.9.9",
      "d OK user=c ip=1.1.1.1"
     ],
     2
    ],
    "expected": [
     [
      "9.9.9.9",
      2
     ]
    ]
   }
  ],
  "tests": [
   {
    "args": [
     [
      "d FAIL user=a ip=9.9.9.9",
      "d FAIL user=b ip=9.9.9.9",
      "d OK user=c ip=1.1.1.1"
     ],
     2
    ],
    "expected": [
     [
      "9.9.9.9",
      2
     ]
    ],
    "hidden": false
   },
   {
    "args": [
     [],
     1
    ],
    "expected": [],
    "hidden": false
   },
   {
    "args": [
     [
      "d FAIL user=a ip=2.2.2.2",
      "d FAIL user=a ip=1.1.1.1",
      "d FAIL user=a ip=1.1.1.1",
      "d FAIL user=a ip=2.2.2.2",
      "d FAIL user=a ip=3.3.3.3"
     ],
     2
    ],
    "expected": [
     [
      "1.1.1.1",
      2
     ],
     [
      "2.2.2.2",
      2
     ]
    ],
    "hidden": true
   },
   {
    "args": [
     [
      "d FAIL user=a ip=5.5.5.5"
     ],
     2
    ],
    "expected": [],
    "hidden": true
   },
   {
    "args": [
     [
      "d FAIL user=a ip=7.7.7.7",
      "d FAIL user=b ip=7.7.7.7",
      "d FAIL user=c ip=7.7.7.7",
      "d FAIL user=a ip=8.8.8.8",
      "d OK user=a ip=7.7.7.7"
     ],
     3
    ],
    "expected": [
     [
      "7.7.7.7",
      3
     ]
    ],
    "hidden": true
   },
   {
    "args": [
     [
      "x FAIL user=a ip=4.4.4.4",
      "x FAIL user=a ip=4.4.4.4",
      "x FAIL user=a ip=6.6.6.6",
      "x FAIL user=a ip=6.6.6.6",
      "x FAIL user=a ip=6.6.6.6"
     ],
     1
    ],
    "expected": [
     [
      "6.6.6.6",
      3
     ],
     [
      "4.4.4.4",
      2
     ]
    ],
    "hidden": true
   }
  ]
 },
 {
  "slug": "run-length-encode",
  "difficulty": "medium",
  "points": 20,
  "tags": [
   "strings"
  ],
  "language": "python",
  "entry": "solve",
  "module": "python-data-structures",
  "needs_review": true,
  "title": {
   "uz": "Takrorlarni siqish",
   "ru": "Сжатие повторов"
  },
  "statement": {
   "uz": "`solve(s)` ketma-ket takrorlanuvchi belgilarni `belgi+soni` ko‘rinishida siqsin (`\"aaab\"` → `\"a3b1\"`). Bo‘sh satr uchun `\"\"`.",
   "ru": "`solve(s)` сжимает подряд идущие одинаковые символы в `символ+число` (`\"aaab\"` → `\"a3b1\"`). Для пустой строки — `\"\"`."
  },
  "constraints": {
   "uz": "`0 ≤ len(s) ≤ 1000`.",
   "ru": "`0 ≤ len(s) ≤ 1000`."
  },
  "starter": "def solve(s):\n    pass",
  "reference": "def solve(s):\n    out = []\n    i = 0\n    while i < len(s):\n        j = i\n        while j < len(s) and s[j] == s[i]:\n            j += 1\n        out.append(s[i] + str(j - i))\n        i = j\n    return ''.join(out)",
  "examples": [
   {
    "args": [
     "aaab"
    ],
    "expected": "a3b1"
   },
   {
    "args": [
     "abc"
    ],
    "expected": "a1b1c1"
   }
  ],
  "tests": [
   {
    "args": [
     "aaab"
    ],
    "expected": "a3b1",
    "hidden": false
   },
   {
    "args": [
     "abc"
    ],
    "expected": "a1b1c1",
    "hidden": false
   },
   {
    "args": [
     ""
    ],
    "expected": "",
    "hidden": true
   },
   {
    "args": [
     "aaaaaaaaaaaa"
    ],
    "expected": "a12",
    "hidden": true
   },
   {
    "args": [
     "aabbaa"
    ],
    "expected": "a2b2a2",
    "hidden": true
   },
   {
    "args": [
     "z"
    ],
    "expected": "z1",
    "hidden": true
   }
  ]
 }
];
