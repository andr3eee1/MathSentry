"""
MathSentry Olympiad Training Dataset Generator
Generates comprehensive Romanian Mathematical Olympiad (ONM/OJM/Baraj) datasets
for fine-tuning proof verification and cascading logic collapse models.
"""

import json
import os
import random

PROBLEMS = [
    {
        "problem_id": "ONM_RO_ALG_BERNOULLI",
        "domain": "Algebră / Inegalități și Inducție Matematică",
        "grade_level": "Clasa a IX-a / a X-a (Etapa Națională)",
        "title": "Inegalitatea lui Bernoulli și Condiția Critică de Semn",
        "enunt_ro": "Fie $x \\in \\mathbb{R}$ cu $x > -1$ și $n \\in \\mathbb{N}^*$. Să se demonstreze prin inducție matematică inegalitatea:\n$$(1 + x)^n \\ge 1 + nx.$$",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Verificarea etapei de bază a inducției (n = 1)",
                "weight_percentage": 15.0,
                "dependencies": [],
                "description_ro": "Verificarea cazului de bază n = 1: (1 + x)¹ = 1 + 1·x, egalitate adevărată pentru orice x ∈ ℝ."
            },
            {
                "step_index": 2,
                "label": "Formularea ipotezei de inducție pentru n = k",
                "weight_percentage": 15.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Presupunerea că inegalitatea (1 + x)^k ≥ 1 + kx este adevărată pentru un k ∈ ℕ* arbitrar fixat."
            },
            {
                "step_index": 3,
                "label": "Pasul inductiv: înmulțirea cu (1 + x) și justificarea pozitivității",
                "weight_percentage": 40.0,
                "dependencies": [
                    2
                ],
                "description_ro": "Înmulțirea ambilor membri cu factorul (1 + x), justificând obligatoriu că 1 + x > 0 (deoarece x > -1), ceea ce conservă sensul inegalității: (1 + x)^(k+1) ≥ (1 + kx)(1 + x)."
            },
            {
                "step_index": 4,
                "label": "Dezvoltarea algebrică, minorarea termenului kx² și concluzia",
                "weight_percentage": 30.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Calculul (1 + kx)(1 + x) = 1 + (k+1)x + kx² și minorarea kx² ≥ 0 pentru a deduce (1 + x)^(k+1) ≥ 1 + (k+1)x, finalizând inducția."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Verificăm baza inducției pentru n = 1: (1 + x)¹ = 1 + x și 1 + 1 · x = 1 + x. Relația este identic satisfăcută.",
                "Presupunem propoziția P(k) adevărată pentru un k ≥ 1 oarecare: (1 + x)^k ≥ 1 + kx.",
                "Pentru a trece la P(k+1), înmulțim ambii membri ai inegalității P(k) cu expresia (1 + x): (1 + x)^k · (1 + x) ≥ (1 + kx)(1 + x), obținând (1 + x)^(k+1) ≥ 1 + x + kx + kx².",
                "Grupăm termenii: 1 + (k+1)x + kx². Deoarece k ∈ ℕ* și x² ≥ 0 pentru orice x real, avem kx² ≥ 0. Eliminând termenul nenegativ kx², rezultă (1 + x)^(k+1) ≥ 1 + (k+1)x. Conform principiului inducției matematice, inegalitatea este demonstrată pentru orice n ∈ ℕ*."
            ],
            "fatal_flaw_step": 3,
            "cascading_invalidated_steps": [
                4
            ],
            "final_score_percentage": 30.0,
            "onm_7p_score": 2.1,
            "teacher_critique_ro": "EROARE FATALĂ DE RAȚIONAMENT LA PASUL 3 (OMISIUNEA JUSTIFICĂRII SEMNULUI LA ÎNMULȚIREA INEGALITĂȚII):\nAi tratat corect Pasul 1 (baza inducției, 15%) și Pasul 2 (ipoteza inductivă, 15%).\nÎnsă la Pasul 3 comiți o eroare logică gravă: ai înmulțit inegalitatea cu expresia (1 + x) fără a preciza și justifica semnul acesteia! Înmulțirea unei inegalități conservă sensul EXCLUSIV dacă factorul de multiplicare este strict pozitiv. Dacă am avea x < -1, atunci 1 + x < 0, iar sensul inegalității s-ar fi inversat obligatoriu (≥ devenea ≤). Ipoteza problemei stipula explicit x > -1 tocmai pentru a garanta 1 + x > 0, dar tu ai folosit multiplicarea mecanic, fără a invoca această premisă indispensabilă.\nMecanismul de colaps în cascadă (Cascading Proof Failure):\nPasul 3 este invalidat complet (0%). Deoarece inegalitatea de la pasul 3 nu a fost justificată riguros, concluzia obținută la Pasul 4 se bazează pe o tranziție nedemonstrată și colapsează la rândul său în cascadă la 0%.\nCum se remediază demonstrația (7.0 / 7.0p):\nLa pasul 3 trebuia precizat: 'Deoarece din ipoteză x > -1, avem 1 + x > 0. Prin urmare, înmulțind inegalitatea P(k) cu numărul strict pozitiv 1 + x, sensul inegalității se conservă: (1 + x)^(k+1) ≥ (1 + kx)(1 + x)'."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Etapa de verificare (baza inducției n = 1): Pentru n = 1, membrul stâng este (1 + x)¹ = 1 + x, iar membrul drept este 1 + 1 · x = 1 + x. Egalitatea are loc pentru orice x ∈ ℝ, deci propoziția P(1) este adevărată.",
                "Ipoteza de inducție: Presupunem adevărată afirmația P(k) pentru un număr natural k ≥ 1 fixat: (1 + x)^k ≥ 1 + kx.",
                "Pasul de inducție P(k) ⟹ P(k+1): Din ipoteza problemei știm că x > -1, ceea ce este echivalent cu 1 + x > 0. Deoarece 1 + x este un număr real strict pozitiv, putem înmulți ambii membri ai inegalității P(k) cu (1 + x) fără ca sensul inegalității să se schimbe. Obținem:\n(1 + x)^k · (1 + x) ≥ (1 + kx)(1 + x) ⟺ (1 + x)^(k+1) ≥ 1 + kx + x + kx².",
                "Dezvoltăm membrul drept: 1 + (k + 1)x + kx². Deoarece k ≥ 1 și x² ≥ 0 pentru orice x ∈ ℝ, avem kx² ≥ 0. Prin urmare:\n1 + (k + 1)x + kx² ≥ 1 + (k + 1)x.\nPrin tranzitivitatea relației de ordine pe ℝ, deducem că:\n(1 + x)^(k+1) ≥ 1 + (k + 1)x,\nceea ce arată că P(k+1) este adevărată.\nConform principiului inducției matematice complete, inegalitatea lui Bernoulli are loc pentru orice n ∈ ℕ* și x > -1."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_ALG_FUNC_EQ",
        "domain": "Algebră / Ecuații Funcționale",
        "grade_level": "Clasa a X-a / a XI-a (Etapa Națională)",
        "title": "Ecuație Funcțională cu Bijectivitate pe Corpul Numerelor Reale",
        "enunt_ro": "Să se determine toate funcțiile $f: \\mathbb{R} \\to \\mathbb{R}$ care satisfac relația:\n$$f(x f(y) + f(x)) = x y + f(x), \\quad \\forall x, y \\in \\mathbb{R}.$$",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Substituția x = 1 și relația fundamentală",
                "weight_percentage": 20.0,
                "dependencies": [],
                "description_ro": "Efectuarea substituției particulare x = 1 în ecuația funcțională și obținerea relației f(f(y) + f(1)) = y + f(1) pentru orice y ∈ ℝ."
            },
            {
                "step_index": 2,
                "label": "Demonstrarea bijectivității (surjectivitate și injectivitate)",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Deducerea riguroasă a surjectivității (membrul drept y + f(1) acoperă ℝ) și a injectivității: f(y₁) = f(y₂) implică f(f(y₁) + f(1)) = f(f(y₂) + f(1)), de unde y₁ = y₂."
            },
            {
                "step_index": 3,
                "label": "Substituția y = 0 și exploatarea injectivității",
                "weight_percentage": 30.0,
                "dependencies": [
                    2
                ],
                "description_ro": "Efectuarea substituției y = 0 pentru a obține f(x f(0) + f(x)) = f(x), urmată de aplicarea injectivității demonstrate pentru a deduce x f(0) + f(x) = x, adică f(x) = x(1 - f(0))."
            },
            {
                "step_index": 4,
                "label": "Determinarea constantei, unicitatea și verificarea soluției",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Calculul f(0) = 0 conducând la f(x) = x, urmat de verificarea obligatorie a soluției f(x) = x în ecuația inițială și concluzia finală."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Fixăm x = 1 în ecuația dată și obținem: f(f(y) + f(1)) = y + f(1) pentru orice y ∈ ℝ.",
                "Deoarece când y parcurge ℝ, membrul drept y + f(1) parcurge toate valorile reale, rezultă că funcția f este surjectivă pe ℝ. Fiind o funcție surjectivă pe o mulțime numerică, f este automat și injectivă, prin urmare f este bijectivă.",
                "Punem acum y = 0 în ecuația funcțională inițială și avem: f(x f(0) + f(x)) = x · 0 + f(x) = f(x). Deoarece am arătat anterior că f este injectivă, rezultă că argumentele funcției trebuie să fie egale: x f(0) + f(x) = x, de unde obținem f(x) = x(1 - f(0)).",
                "Pentru x = 0 obținem f(0) = 0, deci f(x) = x. Verificând în ecuație: x · y + x = xy + x, identitate adevărată pentru orice x, y ∈ ℝ. Deci unica soluție este f(x) = x."
            ],
            "fatal_flaw_step": 2,
            "cascading_invalidated_steps": [
                3,
                4
            ],
            "final_score_percentage": 20.0,
            "onm_7p_score": 1.4,
            "teacher_critique_ro": "EROARE FATALĂ DE RAȚIONAMENT LA PASUL 2 (CONFUNDAREA SURJECTIVITĂȚII CU INJECTIVITATEA PE MULȚIMI INFINITE):\nAi obținut corect la Pasul 1 relația f(f(y) + f(1)) = y + f(1) și surjectivitatea funcției (se acordă integral cele 20% corespunzătoare Pasului 1).\nÎnsă afirmația de la Pasul 2: 'Fiind o funcție surjectivă pe o mulțime numerică, f este automat și injectivă' reprezintă o eroare logică gravă, inacceptabilă la nivel de olimpiadă! Pe mulțimi infinite (cum este ℝ), surjectivitatea NU implică injectivitatea (echivalența este valabilă exclusiv pe mulțimi finite). Contraexemplu elementar: g(t) = t³ - t este surjectivă pe ℝ, dar nu este injectivă, având rădăcinile g(-1) = g(0) = g(1) = 0.\nMecanismul de colaps în cascadă: Pasul 2 primește 0%. Deoarece injectivitatea nu a fost dovedită, simplificarea de la Pasul 3 (f(u) = f(v) ⟹ u = v) este nevalidă și se prăbușește la 0%. Forma liniară de la Pasul 4 derivă dintr-un pas fals și colapsează de asemenea la 0%.\nCum se remediază (7.0 / 7.0p): Injectivitatea se deducea direct din Pasul 1: dacă f(y₁) = f(y₂), atunci f(y₁) + f(1) = f(y₂) + f(1), iar aplicând f obținem f(f(y₁) + f(1)) = f(f(y₂) + f(1)), deci y₁ + f(1) = y₂ + f(1) ⟹ y₁ = y₂."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Efectuăm substituția x = 1 în ecuația funcțională dată f(x f(y) + f(x)) = xy + f(x). Obținem identitatea fundamentală: f(f(y) + f(1)) = y + f(1), valabilă pentru orice y ∈ ℝ.",
                "Demonstrăm bijectivitatea funcției f:\n(i) Surjectivitate: Când y parcurge ℝ, membrul drept y + f(1) parcurge întregul ℝ. Rezultă că f este surjectivă.\n(ii) Injectivitate: Fie y₁, y₂ ∈ ℝ astfel încât f(y₁) = f(y₂). Adunând f(1), avem f(y₁) + f(1) = f(y₂) + f(1). Aplicând funcția f în ambii membri obținem f(f(y₁) + f(1)) = f(f(y₂) + f(1)). Utilizând identitatea obținută la Pasul 1, rezultă y₁ + f(1) = y₂ + f(1), de unde y₁ = y₂. Așadar, f este strict injectivă.\nFiind injectivă și surjectivă, f este bijectivă pe ℝ.",
                "Efectuăm acum substituția y = 0 în ecuația funcțională inițială: f(x f(0) + f(x)) = x · 0 + f(x) = f(x). Deoarece f este injectivă pe ℝ, ecuația f(u) = f(v) implică u = v. Aplicând această proprietate pentru u = x f(0) + f(x) și v = x, obținem: x f(0) + f(x) = x, de unde rezultă forma generală f(x) = x(1 - f(0)), valabilă pentru orice x ∈ ℝ.",
                "Notăm constanta c = 1 - f(0) ∈ ℝ, deci f(x) = c x. Înlocuind x = 0, obținem f(0) = c · 0 = 0. Prin urmare, c = 1 - 0 = 1, ceea ce implică f(x) = x pentru orice x ∈ ℝ.\nVerificare: Înlocuind f(t) = t în ecuația dată: f(x f(y) + f(x)) = f(x · y + x) = xy + x, iar membrul drept este xy + f(x) = xy + x. Egalitatea este satisfăcută identic pe ℝ × ℝ.\nConcluzie: Funcția unică ce satisface ecuația este f: ℝ → ℝ, f(x) = x."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_ALG_TITU_LEMMA",
        "domain": "Algebră / Inegalitatea Cauchy-Schwarz pe Fracții",
        "grade_level": "Clasa a IX-a / a X-a (Olimpiada Județeană / Națională)",
        "title": "Minimizare de Fracții Simetrice prin Lema lui Titu",
        "enunt_ro": "Fie $a, b, c > 0$ astfel încât $a + b + c = 1$. Să se demonstreze că:\n$$\\frac{a^2}{b + c} + \\frac{b^2}{c + a} + \\frac{c^2}{a + b} \\ge \\frac{1}{2}.$$",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Formularea Lemei lui Titu (Cauchy-Schwarz)",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Enunțarea formei Engel/Titu a inegalității Cauchy-Schwarz: pentru x, y, z ∈ ℝ și u, v, w > 0, avem x²/u + y²/v + z²/w ≥ (x+y+z)²/(u+v+w)."
            },
            {
                "step_index": 2,
                "label": "Verificarea riguroasă a pozitivității numitorilor",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Justificarea explicită că numitorii b + c, c + a, a + b sunt strict pozitivi datorită ipotezei a, b, c > 0."
            },
            {
                "step_index": 3,
                "label": "Aplicarea lemei și sumarea numitorilor",
                "weight_percentage": 25.0,
                "dependencies": [
                    1,
                    2
                ],
                "description_ro": "Calculul sumei numitorilor (b+c)+(c+a)+(a+b) = 2(a+b+c) = 2 și a numărătorilor (a+b+c)² = 1² = 1, deducând minorarea 1/2."
            },
            {
                "step_index": 4,
                "label": "Analiza cazului de egalitate",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Determinarea cazului de egalitate: a/(b+c) = b/(c+a) = c/(a+b), obținând a = b = c = 1/3."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Aplicăm inegalitatea Cauchy-Schwarz sub forma Engel: a²/(b+c) + b²/(c+a) + c²/(a+b) ≥ (a+b+c)² / ((b+c) + (c+a) + (a+b)).",
                "Numitorul devine 2a + 2b + 2c = 2(a+b+c) = 2 · 1 = 2, iar numărătorul este (a+b+c)² = 1² = 1. Deci suma este ≥ 1/2.",
                "Egalitatea are loc dacă și numai dacă numărătorii sunt egali cu numitorii, adică a² = b+c, b² = c+a, c² = a+b.",
                "Rezolvând acest sistem, obținem a = 1, b = 0, c = 0, care dă suma 1/2. Deci inegalitatea este demonstrată."
            ],
            "fatal_flaw_step": 3,
            "cascading_invalidated_steps": [
                4
            ],
            "final_score_percentage": 50.0,
            "onm_7p_score": 3.5,
            "teacher_critique_ro": "EROARE GRAVĂ LA PASUL 3 (CONDIȚIA DE EGALITATE ÎN CAUCHY-SCHWARZ ȘI VIOLAREA IPOTEZEI a, b, c > 0):\nAi aplicat corect forma fracționară Cauchy-Schwarz la Pașii 1 și 2 (se acordă 50%).\nÎnsă la Pasul 3 afirmi că egalitatea are loc când 'numărătorii sunt egali cu numitorii (a² = b+c)'. Aceasta este o confuzie matematică totală! În inegalitatea Cauchy-Schwarz (sau Lema lui Titu), egalitatea are loc dacă și numai dacă șirurile sunt PROPORȚIONALE: a/(b+c) = b/(c+a) = c/(a+b), ceea ce conduce la a = b = c = 1/3.\nIar la Pasul 4 găsești 'soluția' b = 0, c = 0, violând flagrant ipoteza strictă a problemei că a, b, c > 0 (numere strict pozitive)! Dacă b = c = 0, fracția b²/(c+a) = 0/a = 0, dar fracția a²/(b+c) devine a²/0, adică împărțire la zero!\nMecanismul de colaps în cascadă: Pasul 3 este anulat (0%), iar Pasul 4 (care include împărțiri la zero nerealizate și o egalitate falsă) colapsează la 0%.\nCum se remediază (7.0 / 7.0p): Condiția de egalitate este proporționalitatea termenilor: a/(b+c) = b/(c+a) = c/(a+b) ⟺ a = b = c. Cum a+b+c=1, avem a=b=c=1/3."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Utilizăm Lema lui Titu (forma fracționară a inegalității Cauchy-Schwarz / Inegalitatea lui Bergström): pentru orice numere reale x, y, z și numere reale strict pozitive u, v, w > 0, are loc inegalitatea:\n$$\\frac{x^2}{u} + \\frac{y^2}{v} + \\frac{z^2}{w} \\ge \\frac{(x + y + z)^2}{u + v + w}.$$",
                "Verificăm condițiile de aplicabilitate: Din ipoteză avem a, b, c > 0. Rezultă că numitorii sunt strict pozitivi: b + c > 0, c + a > 0, a + b > 0. Condițiile lemei sunt pe deplin satisfăcute.",
                "Aplicăm lema pentru x = a, y = b, z = c și u = b + c, v = c + a, w = a + b:\n$$\\frac{a^2}{b + c} + \\frac{b^2}{c + a} + \\frac{c^2}{a + b} \\ge \\frac{(a + b + c)^2}{(b + c) + (c + a) + (a + b)}.$$\nCalculăm numitorul: (b + c) + (c + a) + (a + b) = 2(a + b + c) = 2 · 1 = 2.\nNumărătorul este: (a + b + c)² = 1² = 1.\nPrin urmare:\n$$\\frac{a^2}{b + c} + \\frac{b^2}{c + a} + \\frac{c^2}{a + b} \\ge \\frac{1}{2}.$$",
                "Analiza cazului de egalitate: În inegalitatea Cauchy-Schwarz, egalitatea are loc dacă și numai dacă vectorii sunt proporționali, adică:\n$$\\frac{a}{b + c} = \\frac{b}{c + a} = \\frac{c}{a + b}.$$\nAdunând 1 la fiecare raport, obținem:\n$$\\frac{a + b + c}{b + c} = \\frac{a + b + c}{c + a} = \\frac{a + b + c}{a + b}.$$\nCum a + b + c = 1 ≠ 0, rezultă b + c = c + a = a + b, de unde a = b = c.\nDeoarece a + b + c = 1, obținem a = b = c = 1/3 > 0. Egalitatea este efectiv atinsă pentru a = b = c = 1/3, ceea ce finalizează riguros demonstrația."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_NT_DIOPH_EXP",
        "domain": "Teoria Numerelor / Ecuații Diofantice Exponențiale",
        "grade_level": "Clasa a X-a (Olimpiada Națională)",
        "title": "Ecuație Diofantică Exponențială în Numere Naturale Nenule",
        "enunt_ro": "Să se determine toate tripletele de numere naturale nenule $(x, y, z) \\in (\\mathbb{N}^*)^3$ care satisfac ecuația diofantică:\n$$2^x + 3^y = z^2.$$",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Analiza modulo 3 și paritatea lui x",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Analiza ecuației modulo 3: justificarea că 3 nu divide z, deducerea că z² ≡ 1 (mod 3), ceea ce impune 2^x ≡ 1 (mod 3), deci x este par, x = 2k (k ≥ 1)."
            },
            {
                "step_index": 2,
                "label": "Factorizarea în ℤ ca diferență de pătrate",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Scrierea ecuației sub forma (z - 2^k)(z + 2^k) = 3^y și identificarea factorilor ca puteri ale lui 3: z - 2^k = 3^a și z + 2^k = 3^b, cu a < b și a + b = y."
            },
            {
                "step_index": 3,
                "label": "Eliminarea lui z și demonstrarea că a = 0",
                "weight_percentage": 25.0,
                "dependencies": [
                    2
                ],
                "description_ro": "Obținerea relației 2^(k+1) = 3^a(3^(b-a) - 1) prin scădere și demonstrarea riguroasă că a = 0 (deoarece dacă a ≥ 1, 3 ar divide 2^(k+1), imposibil)."
            },
            {
                "step_index": 4,
                "label": "Rezolvarea ecuației 3^y - 1 = 2^(k+1), unicitatea și soluția (4, 2, 5)",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Analiza modulo 4 și modulo 8, excluderea cazurilor imposibile, determinarea soluției unice (x, y, z) = (4, 2, 5) și verificarea ei în ecuația inițială."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Privim ecuația dată modulo 3. Deoarece y ≥ 1, termenul 3^y este divizibil cu 3, deci 3^y ≡ 0 (mod 3). Dacă 3 ar divide z, atunci 3 ar divide z² - 3^y = 2^x, ceea ce este absurd deoarece 2^x are doar factori primi de 2. Rezultă că z nu se divide cu 3, deci z² ≡ 1 (mod 3). Ecuația devine 2^x ≡ 1 (mod 3). Cum 2 ≡ -1 (mod 3), avem (-1)^x ≡ 1 (mod 3), ceea ce impune obligatoriu ca x să fie un număr par. Notăm x = 2k, unde k ∈ ℕ*.",
                "Înlocuind x = 2k în ecuație, o rescriem ca o diferență de pătrate: z² - (2^k)² = 3^y ⟺ (z - 2^k)(z + 2^k) = 3^y. Deoarece 3 este număr prim, singurii divizori ai lui 3^y sunt puterile lui 3. Cum z - 2^k < z + 2^k, avem sistemul: z - 2^k = 3^a și z + 2^k = 3^b, unde a, b ∈ ℕ, a < b și a + b = y.",
                "Scăzând prima ecuație a sistemului din a doua, eliminăm pe z: (z + 2^k) - (z - 2^k) = 3^b - 3^a, de unde 2 · 2^k = 2^(k+1) = 3^a(3^(b-a) - 1). În membrul stâng avem 2^(k+1), care este o putere a lui 2 și conține exclusiv factori de 2. În membrul drept avem factorul 3^a, care este o putere a lui 3, deci este un multiplu de 3. Însă un multiplu de 3 nu poate divide o putere a lui 2. Prin urmare, această egalitate este imposibilă.",
                "În concluzie, ecuația diofantică 2^x + 3^y = z² nu admite nicio soluție în mulțimea numerelor naturale nenule (soluția este mulțimea vidă)."
            ],
            "fatal_flaw_step": 3,
            "cascading_invalidated_steps": [
                4
            ],
            "final_score_percentage": 50.0,
            "onm_7p_score": 3.5,
            "teacher_critique_ro": "EROARE FATALĂ DE TEORIA NUMERELOR LA PASUL 3 (OMISIUNEA EXPONENTULUI NUL a = 0):\nAi realizat o primă parte impecabilă: paritatea lui x = 2k (25%) și factorizarea z² - 2^(2k) = 3^y (25%) sunt corecte.\nÎnsă la Pasul 3 comiți o eroare clasică: afirmi că '3^a este o putere a lui 3, deci este un multiplu de 3'. Ai omis complet cazul a = 0! Pentru a = 0, avem 3^a = 3^0 = 1, care NU este multiplu de 3 și divide orice putere a lui 2.\nMecanismul de colaps în cascadă: Pasul 3 primește 0% deoarece a declarat ecuația imposibilă pe o bază falsă. Pasul 4 colapsează la 0%: ai anulat chiar soluția unică reală a problemei (4, 2, 5)!\nCum se remediază (7.0 / 7.0p): Observi că a = 0 este obligatoriu. Atunci z - 2^k = 1 și 2^(k+1) = 3^y - 1. Pentru y = 2 obții 2^(k+1) = 8 ⟹ k = 2, deci x = 4 și z = 5. Pentru y ≥ 3 se demonstrează că nu mai există soluții modulo 4 sau prin factorizare."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Analizăm ecuația dată 2^x + 3^y = z² modulo 3. Cum y ≥ 1, avem 3^y ≡ 0 (mod 3). Dacă 3 | z, atunci 3 | (z² - 3^y) = 2^x, fals, deoarece factorii primi ai lui 2^x sunt doar 2. Așadar z ≢ 0 (mod 3), de unde z² ≡ 1 (mod 3). Ecuația devine 2^x ≡ 1 (mod 3), adică (-1)^x ≡ 1 (mod 3), ceea ce impune ca x să fie număr par. Notăm x = 2k, cu k ∈ ℕ*.",
                "Substituind x = 2k, ecuația devine z² - (2^k)² = 3^y, adică (z - 2^k)(z + 2^k) = 3^y. Deoarece 3 este prim și z - 2^k < z + 2^k, factorii întregi trebuie să fie puteri ale lui 3: z - 2^k = 3^a și z + 2^k = 3^b, unde a, b ∈ ℕ, a < b și a + b = y.",
                "Scăzând cele două relații, obținem: (z + 2^k) - (z - 2^k) = 3^b - 3^a ⟺ 2^(k+1) = 3^a(3^(b-a) - 1). Dacă a ≥ 1, atunci 3 | 3^a, deci 3 | 2^(k+1), contradicție deoarece singurul divizor prim al lui 2^(k+1) este 2. Prin urmare, este obligatoriu ca a = 0. Cum a = 0, avem 3^a = 1 și b = y, deci ecuația devine 2^(k+1) = 3^y - 1, iar z = 2^k + 1.",
                "Rezolvăm ecuația 3^y - 1 = 2^(k+1) în ℕ*:\n- Cazul y = 1: 3¹ - 1 = 2 = 2^(k+1) ⟹ k+1 = 1 ⟹ k = 0, contradicție cu k ≥ 1 (deoarece x ∈ ℕ*).\n- Cazul y = 2: 3² - 1 = 8 = 2³ = 2^(k+1) ⟹ k+1 = 3 ⟹ k = 2. Obținem x = 2k = 4 și z = 2² + 1 = 5. Verificare: 2⁴ + 3² = 16 + 9 = 25 = 5², corect!\n- Cazul y ≥ 3:\n  • Dacă y este impar, y = 2m + 1 (m ≥ 1), atunci 3^y - 1 = 3 · 9^m - 1 ≡ 3 · 1^m - 1 = 2 (mod 4). Însă pentru k ≥ 1, k+1 ≥ 2, deci 2^(k+1) ≡ 0 (mod 4). Contradicție (2 ≡ 0 mod 4).\n  • Dacă y este par, y = 2m (m ≥ 2), atunci 3^(2m) - 1 = (3^m - 1)(3^m + 1) = 2^(k+1). Factorii 3^m - 1 și 3^m + 1 sunt amândoi puteri ale lui 2 a căror diferență este (3^m + 1) - (3^m - 1) = 2. Singurele puteri naturale ale lui 2 cu diferența 2 sunt 2 și 4, de unde 3^m - 1 = 2 ⟹ 3^m = 3 ⟹ m = 1 (ceea ce corespunde cazului y = 2 deja analizat). Pentru m ≥ 2 nu există soluții.\nConcluzie: Singura soluție a ecuației este tripletul (x, y, z) = (4, 2, 5)."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_GEOM_CYCLIC_POWER",
        "domain": "Geometrie Sintetică / Patrulatere Inscriptibile și Puterea Punctului",
        "grade_level": "Clasa a VIII-a / a IX-a (Olimpiada Națională)",
        "title": "Patrulatere Inscriptibile și Puterea Punctului pe Înălțimi",
        "enunt_ro": "Fie $ABC$ un triunghi ascuțitunghic cu $AB \\neq AC$. Fie $AD$ înălțimea din $A$ pe $BC$ ($D \\in BC$). Fie $E$ și $F$ proiecțiile ortogonale ale punctului $D$ pe laturile $AB$, respectiv $AC$. Dreapta $EF$ intersectează dreapta $BC$ în punctul $P$. Să se demonstreze că:\na) Patrulaterul $AEDF$ este inscriptibil.\nb) Patrulaterul $BCEF$ este inscriptibil.\nc) Are loc egalitatea $PD^2 = PE \\cdot PF = PB \\cdot PC$.",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Inscriptibilitatea patrulaterului AEDF",
                "weight_percentage": 20.0,
                "dependencies": [],
                "description_ro": "Demonstrarea că AEDF este inscriptibil datorită unghiurilor drepte ∠AED = ∠AFD = 90°, identificând AD drept diametru al cercului circumscris C₁."
            },
            {
                "step_index": 2,
                "label": "Inscriptibilitatea patrulaterului BCEF",
                "weight_percentage": 30.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Aplicarea teoremei catetei în triunghiurile dreptunghice ADB și ADC pentru a obține AE · AB = AD² = AF · AC, demonstrând că ΔAEF ~ ΔACB și patrulaterul BCEF este inscriptibil."
            },
            {
                "step_index": 3,
                "label": "Calculul puterii punctului P față de cercurile C₁ și C₂",
                "weight_percentage": 30.0,
                "dependencies": [
                    1,
                    2
                ],
                "description_ro": "Justificarea că BC este tangenta în D la cercul C₁ (deoarece AD ⊥ BC și AD este diametru), deci PD² = PE · PF; aplicarea puterii punctului P față de cercul circumscris lui BCEF pentru a deduce PE · PF = PB · PC."
            },
            {
                "step_index": 4,
                "label": "Egalitatea tranzitivă și concluzia finală",
                "weight_percentage": 20.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Combinarea prin tranzitivitate a celor două relații de putere a punctului pentru a stabili egalitatea completă PD² = PE · PF = PB · PC."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "În patrulaterul AEDF, avem DE ⊥ AB ⟹ ∠AED = 90° și DF ⊥ AC ⟹ ∠AFD = 90°. Deoarece suma unghiurilor opuse este ∠AED + ∠AFD = 180°, patrulaterul AEDF este inscriptibil, iar ipotenuza comună a triunghiurilor dreptunghice, segmentul AD, este diametrul cercului circumscris C₁.",
                "Pentru a arăta că patrulaterul BCEF este inscriptibil, observăm pe figură că segmentele BE și CF sunt chiar înălțimi în triunghiul ABC. Prin urmare, unghiurile ∠BEC și ∠BFC sunt unghiuri drepte: ∠BEC = 90° și ∠BFC = 90°. Deoarece vârfurile E și F văd latura BC sub același unghi de 90°, rezultă direct că patrulaterul BCEF este inscriptibil în cercul de diametru BC.",
                "Scriem puterea punctului P față de cercuri. Față de cercul circumscris patrulaterului BCEF, secantele PEF și PBC dau relația: PE · PF = PB · PC. De asemenea, față de cercul circumscris lui AEDF, dreapta PD este tangentă în D, deci avem PD² = PE · PF.",
                "Egalând cele două expresii obținute pentru PE · PF, obținem prin tranzitivitate: PD² = PE · PF = PB · PC, ceea ce finalizează demonstrația cerută la punctul c)."
            ],
            "fatal_flaw_step": 2,
            "cascading_invalidated_steps": [
                3,
                4
            ],
            "final_score_percentage": 20.0,
            "onm_7p_score": 1.4,
            "teacher_critique_ro": "EROARE FATALĂ DE GEOMETRIE LA PASUL 2 (CONFUNDAREA PROIECȚIILOR CU ÎNĂLȚIMILE TRIUNGHIULUI):\nLa Pasul 1 ai demonstrat corect inscriptibilitatea lui AEDF în cercul de diametru AD (20%).\nÎnsă la Pasul 2 comiți o eroare gravă: confunzi proiecțiile ortogonale E și F ale punctului D cu picioarele înălțimilor din C, respectiv B ale triunghiului ABC! Afirmația că 'segmentele BE și CF sunt înălțimi, deci ∠BEC = 90°' este falsă. În ipoteză, DE ⊥ AB și DF ⊥ AC. Punctele E și F nu sunt picioarele înălțimilor triunghiului ABC.\nMecanismul de colaps în cascadă: Pasul 2 primește 0%. Deoarece inscriptibilitatea lui BCEF s-a bazat pe o premisă falsă, cercul circumscris lui BCEF de diametru BC nu există. Relația PE · PF = PB · PC de la Pasul 3 este lipsită de fundament și se prăbușește la 0%. Pasul 4 colapsează la rândul său la 0%.\nCum se remediază (7.0 / 7.0p): Inscriptibilitatea lui BCEF trebuia demonstrată prin teorema catetei în triunghiurile ADB și ADC: AD² = AE · AB și AD² = AF · AC ⟹ AE · AB = AF · AC ⟹ ΔAEF ~ ΔACB (cazul LUL) ⟹ ∠AEF = ∠ACB ⟹ BCEF inscriptibil."
        },
        "sound_submission": {
            "student_steps_ro": [
                "În patrulaterul AEDF, avem DE ⊥ AB ⟹ ∠AED = 90° și DF ⊥ AC ⟹ ∠AFD = 90°. Deoarece punctele E și F aparțin cercului de diametru AD, rezultă că patrulaterul AEDF este inscriptibil în cercul C₁ de diametru AD.",
                "Demonstrăm inscriptibilitatea patrulaterului BCEF:\nÎn triunghiul dreptunghic ΔADB (cu ∠ADB = 90°), DE este înălțimea corespunzătoare ipotenuzei AB. Din teorema catetei, avem: AD² = AE · AB.\nÎn triunghiul dreptunghic ΔADC (cu ∠ADC = 90°), DF este înălțimea corespunzătoare ipotenuzei AC. Din teorema catetei, avem: AD² = AF · AC.\nEgalând cele două relații: AE · AB = AF · AC ⟺ AE / AC = AF / AB.\nCum unghiul ∠EAF este identic cu ∠CAB, conform cazului de asemănare LUL rezultă că ΔAEF ~ ΔACB. Așadar, unghiul exterior ∠AEF este egal cu unghiul opus interior ∠ACB, ceea ce demonstrează riguros că patrulaterul BCEF este inscriptibil într-un cerc notat C₂.",
                "Calculăm puterea punctului P față de cele două cercuri:\n(i) Față de cercul C₁ (circumscris lui AEDF): Diametrul cercului este AD. Deoarece AD ⊥ BC în punctul D, dreapta BC este perpendiculară pe diametrul AD chiar în extremitatea sa D, deci dreapta BC este TANGENTĂ la cercul C₁ în D. Punctul P aparține dreptei BC, deci PD este tangenta din P la C₁. Dreapta PEF este o secantă ce taie C₁ în E și F. Din teorema puterii punctului rezultă: P_{C₁}(P) = PD² = PE · PF.\n(ii) Față de cercul C₂ (circumscris patrulaterului inscriptibil BCEF): Dreptele PEF și PBC sunt două secante duse din punctul exterior P la cercul C₂. Din teorema puterii punctului rezultă: P_{C₂}(P) = PE · PF = PB · PC.",
                "Egalând expresiile puterii punctului P obținute la Pasul 3, avem:\nPD² = PE · PF și PE · PF = PB · PC.\nPrin tranzitivitate, deducem direct egalitatea completă:\nPD² = PE · PF = PB · PC.\nToate cele trei cerințe ale problemei sunt astfel demonstrate riguros."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_COMB_ERDOS_DIV",
        "domain": "Combinatorică / Principiul Cutiei (Dirichlet) și Divizibilitate",
        "grade_level": "Clasa a VII-a / a VIII-a (Olimpiada Națională)",
        "title": "Teorema lui Erdős privind Divizibilitatea pe Submulțimi",
        "enunt_ro": "Fie $n \\ge 1$ un număr natural și mulțimea $S = \\{1, 2, 3, \\dots, 2n\\}$. Fie $A \\subseteq S$ o submulțime cu $|A| = n + 1$ elemente. Să se demonstreze că există două elemente distincte $a, b \\in A$ astfel încât $a$ divide pe $b$ ($a \\mid b$).",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Strategia generală de partiționare și principiul cutiei",
                "weight_percentage": 20.0,
                "dependencies": [],
                "description_ro": "Formularea strategiei de a partiționa mulțimea S în n cutii disjuncte astfel încât oricare două elemente dintr-o cutie să se dividă, permițând aplicarea Principiului Cutiei (Dirichlet) pentru |A| = n + 1."
            },
            {
                "step_index": 2,
                "label": "Construcția canonică a celor n cutii prin părți impare",
                "weight_percentage": 30.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Scrierea oricărui x ∈ S sub forma unică x = 2^k · m (cu m impar), arătând că părțile impare aparțin mulțimii M = {1, 3, ..., 2n - 1} de cardinal n, definind cutiile C_m = {2^k · m ∈ S | k ≥ 0}."
            },
            {
                "step_index": 3,
                "label": "Aplicarea Principiului Cutiei (Dirichlet)",
                "weight_percentage": 25.0,
                "dependencies": [
                    2
                ],
                "description_ro": "Aplicarea principiului lui Dirichlet: plasarea celor n + 1 elemente din A în cele n cutii C_m garantează existența a două elemente distincte a, b ∈ A aparținând aceleiași cutii C_m (aceeași parte impară m)."
            },
            {
                "step_index": 4,
                "label": "Deducerea riguroasă a divizibilității a | b",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Scrierea a = 2^(k₁) · m și b = 2^(k₂) · m cu k₁ < k₂, demonstrând că b / a = 2^(k₂ - k₁) ∈ ℕ*, finalizând că a | b."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Pentru a arăta că există două numere în A care se divid, vom partiționa mulțimea S = {1, 2, ..., 2n} în n cutii disjuncte și vom folosi Principiul Cutiei al lui Dirichlet, deoarece submulțimea A are n + 1 elemente, deci strict mai multe decât numărul de cutii.",
                "Construim cele n cutii grupând numerele consecutive în perechi: C₁ = {1, 2}, C₂ = {3, 4}, C₃ = {5, 6}, ..., C_n = {2n - 1, 2n}. Aceste n cutii sunt evident disjuncte două câte două și reuniunea lor acoperă complet mulțimea S, asigurând divizibilitatea în fiecare cutie.",
                "Deoarece submulțimea A conține n + 1 elemente, iar noi avem exact n cutii C₁, C₂, ..., C_n, conform Principiului Cutiei (Dirichlet) există cel puțin o cutie C_k = {2k - 1, 2k} care conține două elemente din A. Fie aceste două elemente a = 2k - 1 și b = 2k.",
                "Deoarece ambele numere a și b aparțin aceleiași cutii C_k, rezultă că a divide pe b, adică 2k - 1 | 2k. Astfel, am găsit două elemente distincte în A care se divid, demonstrația fiind completă."
            ],
            "fatal_flaw_step": 2,
            "cascading_invalidated_steps": [
                3,
                4
            ],
            "final_score_percentage": 20.0,
            "onm_7p_score": 1.4,
            "teacher_critique_ro": "EROARE FATALĂ DE COMBINATORICĂ LA PASUL 2 (PARTIȚIONARE GREȘITĂ ȘI FALSA DIVIZIBILITATE 2k - 1 | 2k):\nAi enunțat corect intenția de a folosi principiul cutiei (20%).\nÎnsă la Pasul 2 confunzi problema numerelor prime între ele cu problema divizibilității! Împărțirea în n perechi {2k-1, 2k} funcționează pentru cmmdc = 1, dar pentru divizibilitate este complet falsă: două numere consecutive din aceeași cutie NU se divid niciodată (cu excepția {1, 2})! Contraexemplu: {3, 4}, unde 3 nu divide pe 4.\nMecanismul de colaps în cascadă: Pasul 2 primește 0%. Pasul 3 (aplicarea principiului cutiei pe cutii defectuoase) este lipsit de sens (0%). La Pasul 4 afirmi fals că 2k-1 | 2k, colapsând totul la 0%.\nCum se remediază (7.0 / 7.0p): Cutiile trebuiau construite prin descompunerea x = 2^k · m, unde m este număr impar din {1, 3, ..., 2n-1} (exact n cutii). În cutia C_m, orice două elemente sunt de forma 2^(k1)·m și 2^(k2)·m, deci se divid garantat!"
        },
        "sound_submission": {
            "student_steps_ro": [
                "Vom demonstra afirmația construind o partiție a mulțimii S = {1, 2, ..., 2n} în n submulțimi disjuncte (cutii) C₁, C₂, ..., C_n, cu proprietatea că oricare două elemente distincte din aceeași cutie se divid între ele. Aplicând apoi Principiul Cutiei (Dirichlet) pentru cele n + 1 elemente ale mulțimii A, va rezulta existența a cel puțin două elemente din A în aceeași cutie, deci două elemente care se divid.",
                "Construcția canonică a cutiilor:\nOrice număr natural nenul x ∈ S se poate scrie în mod unic sub forma x = 2^k · m, unde k ∈ ℕ este un exponent întreg nenegativ, iar m ∈ ℕ* este un număr impar, numit partea impară a lui x.\nDeoarece x ≤ 2n, numărul impar m este cuprins între 1 și 2n, deci aparține mulțimii tuturor numerelor impare din S:\nM = {1, 3, 5, ..., 2n - 1}.\nCardinalul mulțimii M este: |M| = n.\nPentru fiecare număr impar m ∈ M, definim cutia asociată C_m ca fiind mulțimea numerelor din S a căror parte impară este m:\nC_m = {x ∈ S | x = 2^k · m, k ∈ ℕ} = {m, 2m, 4m, 8m, ...} ∩ S.\nDeoarece scrierea x = 2^k · m este unică, cutiile C_m sunt două câte două disjuncte și reuniunea lor este întregul S. Avem astfel exact n cutii.",
                "Aplicăm Principiul Cutiei (Dirichlet):\nAvem |A| = n + 1 elemente aparținând mulțimii S. Fiecare element x ∈ A este distribuit în cutia C_m corespunzătoare părții sale impare m.\nDeoarece avem n + 1 elemente distribuite în cele |M| = n cutii disjuncte, conform principiului lui Dirichlet există cel puțin o cutie C_m care conține cel puțin două elemente distincte din A. Notăm aceste două elemente cu a, b ∈ A (a ≠ b).",
                "Deducerea relației de divizibilitate:\nCum a, b ∈ C_m, ambele numere au aceeași parte impară m:\na = 2^(k₁) · m  și  b = 2^(k₂) · m, unde k₁, k₂ ∈ ℕ.\nDeoarece a ≠ b, exponenții trebuie să fie distincți: k₁ ≠ k₂. Fără a restrânge generalitatea, putem presupune că k₁ < k₂.\nAtunci raportul celor două numere este:\nb / a = (2^(k₂) · m) / (2^(k₁) · m) = 2^(k₂ - k₁).\nDeoarece k₂ - k₁ ≥ 1 este un număr întreg strict pozitiv, rezultă că 2^(k₂ - k₁) ∈ ℕ*, adică b / a este un număr întreg nenul. Prin urmare, a divide pe b (a | b).\nDemonstrația este completă."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_NT_FERMAT_ORDER",
        "domain": "Teoria Numerelor / Ordin Multiplicativ și Teorema lui Fermat",
        "grade_level": "Clasa a X-a (Olimpiada Națională / Baraj)",
        "title": "Divizibilitatea Exponențială și Ordinul lui 2 Modulo p",
        "enunt_ro": "Fie $p$ un număr prim impar. Să se demonstreze că orice divizor prim $q$ al numărului $2^p - 1$ este de forma $q = 2kp + 1$, unde $k \\in \\mathbb{N}^*$.",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Congruența fundamentală modulo q și eliminarea cazului q = 2",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Observarea că 2^p - 1 este impar, deci q ≠ 2 (q este impar), și scrierea congruenței 2^p ≡ 1 (mod q)."
            },
            {
                "step_index": 2,
                "label": "Definirea ordinului multiplicativ d = ord_q(2) și deducerea d = p",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Fie d = ord_q(2). Din 2^p ≡ 1 (mod q) rezultă d | p. Cum p este prim și d > 1 (2 ≢ 1 mod q), deducem riguros d = p."
            },
            {
                "step_index": 3,
                "label": "Aplicarea Micii Teoreme a lui Fermat și deducerea p | (q - 1)",
                "weight_percentage": 25.0,
                "dependencies": [
                    2
                ],
                "description_ro": "Din Mica Teoremă a lui Fermat, 2^(q-1) ≡ 1 (mod q). Deoarece d este ordinul multiplicativ, avem d | (q - 1), adică p | (q - 1)."
            },
            {
                "step_index": 4,
                "label": "Paritatea lui q - 1 și concluzia q = 2kp + 1",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Cum q este prim impar, q - 1 este par (2 | (q-1)). Deoarece cmmdc(2, p) = 1 (p impar), rezultă 2p | (q - 1), deci q = 2kp + 1 cu k ≥ 1."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Deoarece q | (2^p - 1), avem 2^p ≡ 1 (mod q). Cum 2^p - 1 este un număr impar, divizorul său prim q trebuie să fie impar, deci q > 2.",
                "Din Mica Teoremă a lui Fermat știm că 2^(q-1) ≡ 1 (mod q). Avem astfel două relații: 2^p ≡ 1 (mod q) și 2^(q-1) ≡ 1 (mod q).",
                "Deoarece ambele puteri ale lui 2 dau restul 1 modulo q, exponenții lor trebuie să fie egali sau multipli direcți. Rezultă imediat că p divide q - 1, deci q - 1 = kp.",
                "Cum q este număr prim, k trebuie să fie par, deci q = 2kp + 1."
            ],
            "fatal_flaw_step": 3,
            "cascading_invalidated_steps": [
                4
            ],
            "final_score_percentage": 50.0,
            "onm_7p_score": 3.5,
            "teacher_critique_ro": "EROARE FATALĂ DE TEORIA NUMERELOR LA PASUL 3 (OMISIUNEA NOȚIUNII DE ORDIN MULTIPLICATIV):\nAi realizat corect Pasul 1 și Pasul 2 (50%).\nÎnsă la Pasul 3 comiți un salt logic inacceptabil: afirmi că 'deoarece 2^p ≡ 1 (mod q) și 2^(q-1) ≡ 1 (mod q), exponenții sunt egali sau multipli, deci p | (q-1)'. În teoria numerelor, dacă a^u ≡ 1 (mod q) și a^v ≡ 1 (mod q), NU rezultă că u | v sau v | u! Rezultă doar că a^cmmdc(u, v) ≡ 1 (mod q).\nTrebuia definit explicit ordinul multiplicativ d = ord_q(2), arătat că d | p ⟹ d = p (fiindcă p este prim și d ≠ 1), și abia apoi aplicată proprietatea că d | (q - 1).\nMecanismul de colaps în cascadă: Pasul 3 primește 0%. Deducerea de la Pasul 4 se sprijină pe un salt logic nejustificat și colapsează la 0%.\nCum se remediază (7.0 / 7.0p): Se introduce d = ord_q(2). Din 2^p ≡ 1 mod q rezultă d | p. Deoarece p este prim, d ∈ {1, p}. Cum 2¹ ≢ 1 mod q, avem d = p. Din Fermat 2^(q-1) ≡ 1 mod q rezultă d | (q-1), deci p | (q-1)."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Deoarece q este un divizor prim al numărului 2^p - 1, avem 2^p ≡ 1 (mod q). Observăm că 2^p - 1 este impar pentru orice p ≥ 1, deci q nu poate fi 2. Așadar, q este un număr prim impar (q ≥ 3), ceea ce implică cmmdc(2, q) = 1.",
                "Fie d = ord_q(2) ordinul multiplicativ al lui 2 modulo q (cel mai mic întreg pozitiv k pentru care 2^k ≡ 1 mod q). Conform proprietăților fundamentale ale ordinului multiplicativ, din relația 2^p ≡ 1 (mod q) rezultă în mod necesar că d divide pe p (d | p). Deoarece p este un număr prim, divizorii săi pozitivi sunt doar 1 și p. Dacă d = 1, am avea 2¹ ≡ 1 (mod q) ⟹ q | 1, imposibil pentru un număr prim. Prin urmare, este obligatoriu ca d = p.",
                "Pe de altă parte, deoarece q este prim și cmmdc(2, q) = 1, conform Micii Teoreme a lui Fermat avem:\n$$2^{q-1} \\equiv 1 \\pmod q.$$\nDeoarece d = ord_q(2), orice putere a lui 2 congruentă cu 1 modulo q are exponentul divizibil cu d. Rezultă că d | (q - 1). Cum am stabilit la Pasul 2 că d = p, deducem că p divide pe q - 1 (p | (q - 1)).",
                "Deoarece q este un număr prim impar, numărul q - 1 este un număr par, deci 2 divide pe q - 1 (2 | (q - 1)).\nȘtim că p este un număr prim impar, deci cmmdc(2, p) = 1.\nDeoarece 2 | (q - 1) și p | (q - 1), cu cmmdc(2, p) = 1, rezultă că produsul 2p divide pe q - 1 (2p | (q - 1)).\nPrin urmare, există un întreg k ≥ 1 astfel încât q - 1 = 2kp, ceea ce arată că q este de forma:\n$$q = 2kp + 1, \\quad k \\in \\mathbb{N}^*.$$\nDemonstrația este completă."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_ALG_SEQ_LIMIT",
        "domain": "Algebră și Analiză / Șiruri Recurente și Convergență",
        "grade_level": "Clasa a XI-a (Olimpiada Națională)",
        "title": "Convergența și Calculul Limitei unui Șir Recurent Neliniar",
        "enunt_ro": "Fie șirul $(x_n)_{n \\ge 1}$ definit prin $x_1 = \\frac{1}{2}$ și relația de recurență:\n$$x_{n+1} = \\frac{x_n^2 + 1}{2}, \\quad \\forall n \\ge 1.$$\nSă se demonstreze că șirul $(x_n)_{n \\ge 1}$ este convergent și să se calculeze $\\lim_{n \\to \\infty} x_n$.",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Demonstrarea mărginirii șirului (x_n ∈ (0, 1))",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Demonstrarea prin inducție matematică că 0 < x_n < 1 pentru orice n ≥ 1."
            },
            {
                "step_index": 2,
                "label": "Demonstrarea monotoniei (șir strict crescător)",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Calculul diferenței x_{n+1} - x_n = (x_n - 1)² / 2 > 0 (deoarece x_n < 1), demonstrând că șirul este strict crescător."
            },
            {
                "step_index": 3,
                "label": "Aplicarea Teoremei lui Weierstrass și existența limitei finite L",
                "weight_percentage": 25.0,
                "dependencies": [
                    1,
                    2
                ],
                "description_ro": "Invocarea Teoremei lui Weierstrass (șir monoton și mărginit) pentru a justifica riguros că limita L = lim x_n există și este finită, cu L ∈ [1/2, 1]."
            },
            {
                "step_index": 4,
                "label": "Trecerea la limită în recurență și determinarea L = 1",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Trecerea la limită în relația de recurență: L = (L² + 1)/2 ⟺ (L - 1)² = 0 ⟹ L = 1."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Avem șirul dat prin relația x_{n+1} = (x_n² + 1) / 2 cu x₁ = 1/2.",
                "Presupunem că șirul are limita L. Trecând la limită în ambii membri ai relației de recurență, obținem ecuația:\nL = (L² + 1) / 2.",
                "Înmulțim cu 2 ecuația: 2L = L² + 1 ⟺ L² - 2L + 1 = 0 ⟺ (L - 1)² = 0. Ecuația are rădăcina unică L = 1.",
                "Prin urmare, limita șirului este 1, deci șirul este convergent la 1."
            ],
            "fatal_flaw_step": 1,
            "cascading_invalidated_steps": [
                2,
                3,
                4
            ],
            "final_score_percentage": 0.0,
            "onm_7p_score": 0.0,
            "teacher_critique_ro": "EROARE FATALĂ DE ANALIZĂ MATEMATICĂ LA PASUL 2 (TRECEREA LA LIMITĂ FĂRĂ JUSTIFICAREA CONVERGENȚEI):\nComiți una dintre cele mai grave și sancționate erori de raționament din analiza matematică: treci la limită în relația de recurență ('Presupunem că șirul are limita L') FĂRĂ a demonstra în prealabil că limita L există și este finită!\nUn șir poate satisface o ecuație algebrică formală dar să fie divergent sau să tindă la infinit. Exemplu clasic: șirul x_{n+1} = 2x_n cu x₁ = 1 tinde la +∞, deși ecuația L = 2L ar da L = 0! Trecerea la limită este permisă exclusiv DUPĂ ce s-a demonstrat convergența prin Teorema lui Weierstrass (monotonie + mărginire).\nMecanismul de colaps în cascadă: Pasul 2 este anulat integral (0%). Întrucât ecuația (L - 1)² = 0 se bazează pe o limită a cărei existență nu a fost probată, rezolvarea de la Pasul 3 și concluzia de la Pasul 4 colapsează complet la 0%.\nCum se remediază (7.0 / 7.0p): Trebuia demonstrat prin inducție că 0 < x_n < 1 (mărginit), apoi că x_{n+1} - x_n = (x_n - 1)² / 2 > 0 (strict crescător). Conform teoremei lui Weierstrass, șirul este convergent la o limită L ∈ [1/2, 1], iar abia acum se trece la limită în recurență."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Demonstrăm prin inducție matematică că șirul este mărginit superior de 1 și inferior de 0: 0 < x_n < 1 pentru orice n ≥ 1.\n- Pentru n = 1: x₁ = 1/2 ∈ (0, 1), adevărat.\n- Presupunem 0 < x_k < 1. Atunci 0 < x_k² < 1, de unde 1 < x_k² + 1 < 2. Împărțind la 2, avem 1/2 < (x_k² + 1)/2 < 1, deci 0 < x_{k+1} < 1.\nConform inducției matematice, 0 < x_n < 1 pentru orice n ≥ 1, deci șirul este mărginit.",
                "Studiem monotonia șirului calculând diferența a doi termeni consecutivi:\n$$x_{n+1} - x_n = \\frac{x_n^2 + 1}{2} - x_n = \\frac{x_n^2 - 2x_n + 1}{2} = \\frac{(x_n - 1)^2}{2}.$$\nDeoarece din Pasul 1 știm că x_n < 1 pentru orice n ≥ 1, avem x_n - 1 ≠ 0, deci (x_n - 1)² > 0.\nPrin urmare, x_{n+1} - x_n > 0, ceea ce demonstrează că șirul (x_n)_{n ≥ 1} este strict crescător.",
                "Aplicăm Teorema fundamentală a lui Weierstrass: Șirul (x_n)_{n ≥ 1} fiind strict crescător și mărginit superior (x_n < 1), este convergent și admite o limită finită notată $L = \\lim_{n \\to \\infty} x_n$.\nDeoarece x₁ = 1/2 și șirul este crescător și mărginit în (0, 1), avem L ∈ [1/2, 1].",
                "Trecem la limită în relația de recurență $x_{n+1} = \\frac{x_n^2 + 1}{2}$ când n → ∞:\n$$L = \\frac{L^2 + 1}{2} \\iff 2L = L^2 + 1 \\iff (L - 1)^2 = 0 \\iff L = 1.$$\nCum 1 ∈ [1/2, 1], valoarea este compatibilă cu marginile stabilite.\nConcluzie: Șirul este convergent și $\\lim_{n \\to \\infty} x_n = 1$."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_ALG_NESBITT",
        "domain": "Algebră / Inegalități Simetrice",
        "grade_level": "Clasa a IX-a (Olimpiada Județeană / Națională)",
        "title": "Inegalitatea lui Nesbitt cu Trei Variabile Reale Pozitive",
        "enunt_ro": "Fie $a, b, c > 0$. Să se demonstreze că:\n$$\\frac{a}{b + c} + \\frac{b}{c + a} + \\frac{c}{a + b} \\ge \\frac{3}{2}.$$",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Adunarea constantei 3 și transformarea numărătorilor",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Adunarea a 3 în ambii membri: (a/(b+c) + 1) + (b/(c+a) + 1) + (c/(a+b) + 1) = (a+b+c)(1/(b+c) + 1/(c+a) + 1/(a+b)) ≥ 9/2."
            },
            {
                "step_index": 2,
                "label": "Notarea variabilelor auxiliare x, y, z",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Notarea x = b + c, y = c + a, z = a + b, justificând x, y, z > 0 și x + y + z = 2(a + b + c)."
            },
            {
                "step_index": 3,
                "label": "Aplicarea inegalității mediilor AM-HM",
                "weight_percentage": 25.0,
                "dependencies": [
                    2
                ],
                "description_ro": "Aplicarea AM-HM: ((x + y + z)/3) ≥ 3/(1/x + 1/y + 1/z) ⟺ (x + y + z)(1/x + 1/y + 1/z) ≥ 9."
            },
            {
                "step_index": 4,
                "label": "Deducerea minorării 3/2 și cazul de egalitate a = b = c",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Împărțirea la 2 a relației pentru a deduce suma ≥ 9/2 - 3 = 3/2, arătând că egalitatea are loc dacă și numai dacă a = b = c."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Adunăm 3 la expresia din membrul stâng: (a/(b+c) + 1) + (b/(c+a) + 1) + (c/(a+b) + 1) = (a+b+c)/(b+c) + (a+b+c)/(c+a) + (a+b+c)/(a+b) = (a+b+c)(1/(b+c) + 1/(c+a) + 1/(a+b)).",
                "Deoarece inegalitatea este simetrică în a, b, c, putem presupune fără a restrânge generalitatea că a ≥ b ≥ c > 0.",
                "Din a ≥ b ≥ c rezultă b + c ≤ c + a ≤ a + b. Deoarece numitorii sunt ordonați descrescător, putem elimina numitorii b+c și a+b înlocuindu-i pe toți cu numitorul mijlociu c+a. Obținem (a+b+c) · 3/(c+a) = 3(a+b+c)/(c+a).",
                "Cum a ≥ c, raportul este ≥ 9/2. Scăzând 3, obținem suma ≥ 3/2. Egalitatea are loc pentru a = b = c."
            ],
            "fatal_flaw_step": 3,
            "cascading_invalidated_steps": [
                4
            ],
            "final_score_percentage": 50.0,
            "onm_7p_score": 3.5,
            "teacher_critique_ro": "EROARE GRAVĂ LA PASUL 3 (ÎNLOCUIRE ARBITRARĂ DE NUMITORI ȘI INVERSAREA SENSULUI):\nPasul 1 (adunarea lui 3, 25%) și Pasul 2 (presupunerea ordonării a ≥ b ≥ c, 25%) sunt corecte.\nÎnsă la Pasul 3 faci o eroare fatală: înlocuiești 1/(b+c) + 1/(c+a) + 1/(a+b) cu 3/(c+a) susținând că este o minorare! În realitate, funcția f(t) = 1/t este convexă pe (0, ∞), iar o astfel de substituție forțată schimbă sensul inegalității sau nu este o minorare validă fără aplicarea inegalității mediilor (AM-HM) sau Cauchy-Schwarz.\nMecanismul de colaps în cascadă: Pasul 3 primește 0%. Concluzia de la Pasul 4 derivă dintr-o minorare fictivă și primește 0%.\nCum se remediază (7.0 / 7.0p): Notând x = b+c, y = c+a, z = a+b, aplicai inegalitatea AM-HM: (x+y+z)(1/x + 1/y + 1/z) ≥ 9. De aici 2(a+b+c)(1/x + 1/y + 1/z) ≥ 9 ⟹ suma inițială ≥ 9/2 - 3 = 3/2."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Fie S = a/(b+c) + b/(c+a) + c/(a+b). Adunăm 3 la ambii membri adăugând câte 1 fiecărei fracții:\n$$S + 3 = \\left(\\frac{a}{b+c} + 1\\right) + \\left(\\frac{b}{c+a} + 1\\right) + \\left(\\frac{c}{a+b} + 1\\right) = \\frac{a+b+c}{b+c} + \\frac{a+b+c}{c+a} + \\frac{a+b+c}{a+b}.$$\nFactorizăm termenul comun a + b + c > 0:\n$$S + 3 = (a + b + c)\\left(\\frac{1}{b+c} + \\frac{1}{c+a} + \\frac{1}{a+b}\\right).$$",
                "Introducem notațiile auxiliare: x = b + c, y = c + a, z = a + b. Deoarece a, b, c > 0, avem x, y, z > 0. Suma lor este:\n$$x + y + z = (b + c) + (c + a) + (a + b) = 2(a + b + c) \\iff a + b + c = \\frac{x + y + z}{2}.$$\nRescriem relația în funcție de x, y, z:\n$$S + 3 = \\frac{1}{2}(x + y + z)\\left(\\frac{1}{x} + \\frac{1}{y} + \\frac{1}{z}\\right).$$",
                "Aplicăm inegalitatea mediilor AM-HM pentru numerele strict pozitive x, y, z > 0:\n$$\\frac{x + y + z}{3} \\ge \\frac{3}{\\frac{1}{x} + \\frac{1}{y} + \\frac{1}{z}} \\iff (x + y + z)\\left(\\frac{1}{x} + \\frac{1}{y} + \\frac{1}{z}\\right) \\ge 9.$$",
                "Înmulțind cu 1/2 inegalitatea obținută la Pasul 3, avem:\n$$S + 3 = \\frac{1}{2}(x + y + z)\\left(\\frac{1}{x} + \\frac{1}{y} + \\frac{1}{z}\\right) \\ge \\frac{9}{2}.$$\nScăzând 3 din ambii membri, deducem:\n$$S \\ge \\frac{9}{2} - 3 = \\frac{3}{2}.$$\nEgalitatea în AM-HM are loc dacă și numai dacă x = y = z ⟺ b + c = c + a = a + b ⟺ a = b = c. Inegalitatea lui Nesbitt este demonstrată complet."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_NT_WILSON_QUAD_RESIDUE",
        "domain": "Teoria Numerelor / Congruențe și Teorema lui Wilson",
        "grade_level": "Clasa a X-a (Olimpiada Națională)",
        "title": "Solubilitatea Congruenței x² ≡ -1 (mod p) și Numere Prime de Forma 4k + 1",
        "enunt_ro": "Fie $p$ un număr prim impar. Să se demonstreze că congruența $x^2 \\equiv -1 \\pmod p$ admite soluții întregi dacă și numai dacă $p \\equiv 1 \\pmod 4$.",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Implicația directă: aplicarea Micii Teoreme a lui Fermat",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Dacă x² ≡ -1 (mod p), atunci p ∤ x, deci conform Fermat: 1 ≡ x^(p-1) = (x²)^((p-1)/2) ≡ (-1)^((p-1)/2) (mod p)."
            },
            {
                "step_index": 2,
                "label": "Deducerea condiției p ≡ 1 (mod 4)",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Deoarece p ≥ 3, relația (-1)^((p-1)/2) ≡ 1 (mod p) impune (-1)^((p-1)/2) = 1, deci (p-1)/2 este par, adică p ≡ 1 (mod 4)."
            },
            {
                "step_index": 3,
                "label": "Implicația reciprocă: gruparea factorilor din Teorema lui Wilson",
                "weight_percentage": 25.0,
                "dependencies": [
                    2
                ],
                "description_ro": "Fie p = 4k + 1. În (p-1)! = 1 · 2 · ... · (p-1), scriem p - j ≡ -j (mod p) pentru j = 1, ..., 2k, deducând (p-1)! ≡ (-1)^(2k) · ((2k)! )² ≡ ((2k)! )² (mod p)."
            },
            {
                "step_index": 4,
                "label": "Aplicarea Teoremei lui Wilson și construirea soluției explicite",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Din Teorema lui Wilson, (p-1)! ≡ -1 (mod p). Rezultă ((2k)! )² ≡ -1 (mod p), deci x = (2k)! este o soluție efectivă."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Presupunem că există x ∈ ℤ astfel încât x² ≡ -1 (mod p). Atunci p nu divide x, deci putem aplica Mica Teoremă a lui Fermat: x^(p-1) ≡ 1 (mod p).",
                "Scriem x^(p-1) = (x²)^((p-1)/2) ≡ (-1)^((p-1)/2) (mod p). Pentru ca -1 ridicat la o putere să fie congruent cu 1 modulo p, este necesar ca puterea (p-1)/2 să fie pară, deci (p-1)/2 = 2k, de unde p = 4k + 1 ≡ 1 (mod 4).",
                "Pentru reciproca, dacă p ≡ 1 (mod 4), orice număr prim de această formă este suma a două pătrate conform teoremei lui Fermat: p = a² + b².",
                "Împărțind cu b², obținem (a/b)² + 1 = p/b² ≡ 0 (mod p), deci (a b^(-1))² ≡ -1 (mod p). Astfel am demonstrat ambele sensuri."
            ],
            "fatal_flaw_step": 3,
            "cascading_invalidated_steps": [
                4
            ],
            "final_score_percentage": 50.0,
            "onm_7p_score": 3.5,
            "teacher_critique_ro": "EROARE FATALĂ DE RAȚIONAMENT LA PASUL 3 (CIRCULARITATE ȘI INVOCAREA UNEI TEOREME MULT MAI TARI):\nPrima implicație (x² ≡ -1 ⟹ p ≡ 1 mod 4) este demonstrată impecabil la Pașii 1 și 2 (50%).\nÎnsă la Pasul 3 comiți o eroare metodologică gravă: încerci să demonstrezi că x² ≡ -1 mod p are soluție invocând Teorema lui Fermat despre suma a două pătrate (p = a² + b²). Aceasta este o eroare clasică de circularitate (petitio principii): demonstrația că p = a² + b² se bazează ea însăși, în mod indispensabil, pe existența unei soluții pentru x² ≡ -1 (mod p)! Nu poți folosi un rezultat mult mai profund pentru a demonstra propria sa lemă fundamentală.\nMecanismul de colaps în cascadă: Pasul 3 primește 0%, iar Pasul 4 colapsează la 0%.\nCum se remediază (7.0 / 7.0p): Reciproca se demonstrează direct prin Teorema lui Wilson: (p-1)! ≡ -1 mod p. Grupând termenii p - j ≡ -j mod p pentru j de la 1 la (p-1)/2, obții (( (p-1)/2 )! )² · (-1)^((p-1)/2) ≡ -1 mod p. Cum p ≡ 1 mod 4, (-1)^((p-1)/2) = 1, rezultă x = ((p-1)/2)! este soluție."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Implicația directă (⟹): Presupunem că ecuația x² ≡ -1 (mod p) are o soluție întreagă x. Deoarece p este prim impar și x² ≡ -1 (mod p), rezultă că p nu divide x (altfel 0 ≡ -1 mod p, imposibil). Conform Micii Teoreme a lui Fermat, avem x^(p-1) ≡ 1 (mod p).",
                "Scriem exponentul p - 1 ca 2 · ((p - 1)/2):\n$$1 \\equiv x^{p-1} = (x^2)^{\\frac{p-1}{2}} \\equiv (-1)^{\\frac{p-1}{2}} \\pmod p.$$\nAceasta înseamnă că p divide numărul (-1)^((p-1)/2) - 1. Dacă (p - 1)/2 ar fi impar, am avea (-1)^((p-1)/2) = -1, deci p | (-2), ceea ce ar implica p = 2, contrazicând faptul că p este prim impar (p ≥ 3). Prin urmare, (p - 1)/2 trebuie să fie număr par. Notând (p - 1)/2 = 2k (k ∈ ℕ*), rezultă p = 4k + 1, adică p ≡ 1 (mod 4).",
                "Implicația reciprocă (⟸): Fie p un prim de forma p = 4k + 1. Considerăm produsul (p - 1)! din Teorema lui Wilson:\n$$(p - 1)! = 1 \\cdot 2 \\cdot \\dots \\cdot (2k) \\cdot (2k + 1) \\cdot \\dots \\cdot (4k).$$\nPentru fiecare factor din a doua jumătate, avem congruența modulo p:\n$$4k = p - 1 \\equiv -1 \\pmod p,$$\n$$4k - 1 = p - 2 \\equiv -2 \\pmod p,$$\n$$\\dots,$$\n$$2k + 1 = p - 2k \\equiv -2k \\pmod p.$$\nÎnlocuind acești 2k factori în produs, obținem:\n$$(p - 1)! \\equiv (1 \\cdot 2 \\cdot \\dots \\cdot 2k) \\cdot [(-1)(-2) \\dots (-2k)] = ((2k)!)^2 \\cdot (-1)^{2k} \\pmod p.$$",
                "Deoarece p = 4k + 1, numărul de factori negativi este 2k, care este par. Deci (-1)^(2k) = 1. Relația devine:\n$$(p - 1)! \\equiv ((2k)!)^2 \\pmod p.$$\nConform Teoremei lui Wilson, pentru orice număr prim p avem (p - 1)! ≡ -1 (mod p). Prin tranzitivitate:\n$$((2k)!)^2 \\equiv -1 \\pmod p.$$\nNotând $x = (2k)! = \\left(\\frac{p-1}{2}\\right)! \\in \\mathbb{Z}$, avem $x^2 \\equiv -1 \\pmod p$. Soluția există și este explicit construită. Echivalența este complet demonstrată."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_COMB_INVARIANT_GRID",
        "domain": "Combinatorică / Invarianți și Colorări",
        "grade_level": "Clasa a VII-a / a VIII-a (Olimpiada Națională)",
        "title": "Invarianți de Semn pe Linii și Coloane ale unei Table Pătratice",
        "enunt_ro": "Pe o tablă de șah de dimensiune $8 \\times 8$ sunt așezate 64 de jetoane având înscrise numere din $\\{-1, 1\\}$. La fiecare pas, este permis să se aleagă o linie sau o coloană întreagă și să se schimbe semnul tuturor celor 8 numere de pe linia sau coloana respectivă. Se poate ajunge, după un număr finit de pași, la o configurație în care toate numerele de pe tablă sunt egale cu $+1$, pornind de la o configurație inițială care conține exact un singur număr egal cu $-1$ și 63 de numere egale cu $+1$?",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Definirea funcției invariant globale de produs",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Construirea unui invariant adecvat: produsul tuturor celor 64 de numere de pe tablă, P = ∏_{i=1}^8 ∏_{j=1}^8 a_{i,j}."
            },
            {
                "step_index": 2,
                "label": "Calculul valorii inițiale și a valorii țintă a invariantului",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Calculul produsului inițial: P_init = (-1)¹ · (+1)⁶³ = -1. Calculul produsului configurației finale dorite: P_final = (+1)⁶⁴ = +1."
            },
            {
                "step_index": 3,
                "label": "Analiza comportamentului invariantului sub operația permisă",
                "weight_percentage": 25.0,
                "dependencies": [
                    1,
                    2
                ],
                "description_ro": "La schimbarea semnului pe o linie (sau coloană), toate cele 8 elemente se înmulțesc cu -1, deci noul produs P' devine P · (-1)⁸ = P · 1 = P."
            },
            {
                "step_index": 4,
                "label": "Constatarea invariabilității stricte și concluzia imposibilității",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Deoarece operația păstrează invariant produsul P, iar P_init = -1 ≠ +1 = P_final, este imposibil să se ajungă la configurația cu toate elementele +1."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Considerăm tabla de 8x8. În starea inițială avem 63 de numere de +1 și un singur număr de -1. Fie căsuța cu -1 aflată pe linia r și coloana c.",
                "Dacă alegem linia r și îi schimbăm semnul, căsuța cu -1 va deveni +1, deci am scăpat de numărul -1.",
                "Însă celelalte 7 căsuțe de pe linia r care erau +1 vor deveni acum -1. Avem acum 7 numere egale cu -1.",
                "Pentru a scăpa de ele, schimbăm semnele pe cele 7 coloane corespunzătoare. Deoarece la fiecare pas putem manipula liniile și coloanele, se poate ajunge la toate numerele +1."
            ],
            "fatal_flaw_step": 1,
            "cascading_invalidated_steps": [
                2,
                3,
                4
            ],
            "final_score_percentage": 0.0,
            "onm_7p_score": 0.0,
            "teacher_critique_ro": "EROARE FATALĂ DE COMBINATORICĂ LA PASUL 1 (OMISIUNEA COMPLETĂ A METODEI INVARIANTULUI):\nÎn loc să cauți un invariant matematic conservat de operația permisă, ai încercat o abordare euristică ad-hoc și ai afirmat la final că 'se poate ajunge la toate numerele +1', când răspunsul riguros este categoric NU!\nProblema se rezolvă exclusiv prin tehnica INVARIANTULUI. La fiecare pas se schimbă simultan semnele a exact 8 numere, deci produsul celor 64 de jetoane P = ∏ a_{i,j} se înmulțește cu (-1)⁸ = +1, rămânând neschimbat. Cum produsul inițial este -1, iar cel final dorit este +1, este absolut IMPOSIBIL să se ajungă la configurația cerută."
        },
        "sound_submission": {
            "student_steps_ro": [
                "Pentru a stabili dacă se poate trece de la configurația inițială la cea finală, vom căuta un INVARIANT al transformării permise de enunț.\nDefinim mărimea $P$ ca fiind produsul tuturor celor 64 de numere de pe tabla $8 \\times 8$:\n$$P = \\prod_{i=1}^8 \\prod_{j=1}^8 a_{i,j}, \\quad \\text{unde } a_{i,j} \\in \\{-1, 1\\}.$$",
                "Calculăm valoarea lui P pentru starea inițială și pentru starea finală vizată:\n(i) Starea inițială conține exact un jeton cu numărul -1 și 63 de jetoane cu numărul +1. Produsul inițial este:\n$$P_{\\text{init}} = (-1)^1 \\cdot (+1)^{63} = -1.$$\n(ii) Starea finală dorită este cea în care toate cele 64 de numere sunt egale cu +1. Produsul final ar fi:\n$$P_{\\text{final}} = (+1)^{64} = +1.$$",
                "Analizăm efectul operației permise asupra valorii mărimii P:\nLa orice pas, alegem o linie întreagă (sau o coloană întreagă) și schimbăm semnele tuturor numerelor de pe acea linie (sau coloană).\nFiecare linie conține exact 8 elemente. La schimbarea simultană a semnelor celor 8 elemente $x_1, x_2, \\dots, x_8$, produsul lor devine:\n$$(-x_1)(-x_2)\\dots(-x_8) = (-1)^8 \\cdot (x_1 x_2 \\dots x_8) = 1 \\cdot (x_1 x_2 \\dots x_8) = x_1 x_2 \\dots x_8.$$\nPrin urmare, noul produs al tuturor numerelor de pe tablă, $P'$, satisface relația:\n$$P' = P \\cdot (-1)^8 = P \\cdot 1 = P.$$\nExact același calcul este valabil și pentru orice coloană, întrucât orice coloană are de asemenea 8 elemente.",
                "Constatăm că valoarea produsului total $P$ este un INVARIANT strict al jocului (rămâne constantă după oricâți pași efectuați).\nDeoarece $P_{\\text{init}} = -1$, după orice număr finit de operații permise produsul tablei va fi obligatoriu tot $-1$.\nÎnsă configurația în care toate numerele sunt $+1$ are produsul $P_{\\text{final}} = +1$.\nCum $-1 \\neq +1$, rezultă că este IMPOSIBIL să se ajungă la o configurație în care toate numerele de pe tablă sunt egale cu $+1$."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    },
    {
        "problem_id": "ONM_RO_POLY_INTEGER_ROOTS",
        "domain": "Algebră / Polinoame cu Coeficienți Întregi",
        "grade_level": "Clasa a X-a / a XII-a (Olimpiada Națională)",
        "title": "Imposibilitatea Rădăcinilor Întregi pentru Polinoame cu Valori Impare",
        "enunt_ro": "Fie $P(X) = a_n X^n + a_{n-1} X^{n-1} + \\dots + a_1 X + a_0$ un polinom cu coeficienți întregi ($a_i \\in \\mathbb{Z}$). Presupunem că $P(0)$ și $P(1)$ sunt ambele numere impare. Să se demonstreze că polinomul $P(X)$ nu admite nicio rădăcină întreagă.",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Paritatea coeficientului liber P(0) = a_0",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Observarea că P(0) = a_0 este impar, deci a_0 ≡ 1 (mod 2)."
            },
            {
                "step_index": 2,
                "label": "Paritatea sumei coeficienților P(1)",
                "weight_percentage": 25.0,
                "dependencies": [
                    1
                ],
                "description_ro": "Observarea că P(1) = ∑ a_i este impar, deci numărul coeficienților impari este impar."
            },
            {
                "step_index": 3,
                "label": "Proprietatea de divizibilitate a polinoamelor cu coeficienți întregi",
                "weight_percentage": 25.0,
                "dependencies": [
                    1,
                    2
                ],
                "description_ro": "Invocarea proprietății clasice: pentru orice r, s ∈ ℤ, r - s divide P(r) - P(s)."
            },
            {
                "step_index": 4,
                "label": "Reducerea la absurd și analiza parității presupusei rădăcini r",
                "weight_percentage": 25.0,
                "dependencies": [
                    3
                ],
                "description_ro": "Dacă r ∈ ℤ ar fi rădăcină (P(r) = 0): dacă r este par, r - 0 | P(r) - P(0) = -P(0) (par divide impar, absurd); dacă r este impar, r - 1 este par și divide P(r) - P(1) = -P(1) (par divide impar, absurd)."
            }
        ],
        "flawed_submission": {
            "student_steps_ro": [
                "Avem P(0) = a₀ impar, deci a₀ ≡ 1 (mod 2).",
                "Avem P(1) = a_n + a_{n-1} + ... + a₀ impar.",
                "Presupunem prin absurd că P admite o rădăcină întreagă r ∈ ℤ. Conform teoremei rădăcinilor raționale, orice rădăcină întreagă trebuie să dividă termenul liber a₀. Deci r | a₀.",
                "Deoarece a₀ este impar, rezultă că orice divizor al său r este impar. Cum r este impar și suma coeficienților este impară, rezultă P(r) = 0 este par, deci contradicție."
            ],
            "fatal_flaw_step": 3,
            "cascading_invalidated_steps": [
                4
            ],
            "final_score_percentage": 50.0,
            "onm_7p_score": 3.5,
            "teacher_critique_ro": "EROARE GRAVĂ LA PASUL 4 (ARGUMENT DE PARITATE INCOMPLET ȘI INVENTAREA UNEI REGULI NULE):\nLa Pașii 1 și 2 ai stabilit corect paritățile lui P(0) și P(1) (50%). Pasul 3 menționează că r | a₀ doar dacă polinomul este monic sau a_n divide 1, dar presupunerea că r este divizor poate fi acceptată.\nÎnsă la Pasul 4 comiți un non-sequitur grosolan: afirmi că 'cum r este impar și suma coeficienților este impară, rezultă P(r) = 0 este par, deci contradicție'. De unde rezultă că valoarea 0 nu poate fi pară? 0 este un număr par (0 = 2 · 0)! Afirmația că P(r) = 0 este o contradicție pentru că 0 este par este un nonsens matematic.\nMecanismul de colaps: Pasul 4 primește 0%. Trebuia folosită proprietatea că (r - s) divide P(r) - P(s). Dacă r este impar, atunci r - 1 este par și divide P(r) - P(1) = 0 - P(1) = -P(1). Dar un număr par nu poate divide un număr impar! Exact aceeași contradicție se obținea dacă r era par cu r - 0 | P(r) - P(0).\nCum se remediază (7.0 / 7.0p): Folosești r - 0 | P(r) - P(0) = -impar ⟹ r nu poate fi par. Apoi r - 1 | P(r) - P(1) = -impar ⟹ r - 1 nu poate fi par, deci r nu poate fi impar. Niciun întreg nu poate fi nici par, nici impar, contradicție completă!"
        },
        "sound_submission": {
            "student_steps_ro": [
                "Din ipoteză, avem $P(0) = a_0$ este un număr impar, deci $P(0) \\equiv 1 \\pmod 2$.",
                "De asemenea, valoarea $P(1) = a_n + a_{n-1} + \\dots + a_1 + a_0$ este un număr impar, deci $P(1) \\equiv 1 \\pmod 2$.",
                "Utilizăm proprietatea fundamentală a polinoamelor cu coeficienți întregi: pentru orice două numere întregi distincte $u, v \\in \\mathbb{Z}$, diferența $u - v$ divide diferența valorilor polinomului $P(u) - P(v)$:\n$$(u - v) \\mid (P(u) - P(v)).$$\nAceastă proprietate rezultă direct din identitatea $u^k - v^k = (u - v)(u^{k-1} + u^{k-2}v + \\dots + v^{k-1})$, care arată că $u - v \\mid a_k (u^k - v^k)$ pentru orice termen.",
                "Presupunem prin reducere la absurd că există un număr întreg $r \\in \\mathbb{Z}$ care este rădăcină a polinomului $P(X)$, adică $P(r) = 0$.\nAnalizăm paritatea întregului $r$:\n- Cazul 1: $r$ este un număr par ($r \\equiv 0 \\pmod 2$).\nAplicăm proprietatea pentru $u = r$ și $v = 0$:\n$$(r - 0) \\mid (P(r) - P(0)) \\implies r \\mid (0 - P(0)) \\implies r \\mid (-P(0)).$$\nDeoarece $r$ este par, $r$ conține factorul 2, deci 2 divide $-P(0)$, ceea ce ar însemna că $P(0)$ este par. Contradicție cu ipoteza că $P(0)$ este impar!\n- Cazul 2: $r$ este un număr impar ($r \\equiv 1 \\pmod 2$).\nAplicăm proprietatea pentru $u = r$ și $v = 1$:\n$$(r - 1) \\mid (P(r) - P(1)) \\implies (r - 1) \\mid (0 - P(1)) \\implies (r - 1) \\mid (-P(1)).$$\nDeoarece $r$ este impar, diferența $r - 1$ este un număr par nenul, ceea ce înseamnă că 2 divide $-P(1)$, deci $P(1)$ ar fi par. Contradicție cu ipoteza că $P(1)$ este impar!\nDeoarece orice număr întreg este fie par, fie impar, ambele cazuri conduc la contradicții absurde.\nConcluzie: Polinomul $P(X)$ nu admite nicio rădăcină întreagă."
            ],
            "score_percentage": 100.0,
            "onm_7p_score": 7.0
        }
    }
]

def generate_sft_samples(problems):
    """
    Converts raw problems into instruction-tuning SFT Chat format:
    system, user, assistant pairs.
    """
    sft_data = []

    system_prompt = (
        "Ești MathSentry, un motor AI de nivel olimpic specializat în verificarea formală "
        "și notarea pe barem național (ONM/OJM) a demonstrațiilor matematice scrise de mână.\n"
        "Rolul tău nu este să generezi soluții de la zero, ci să auditezi riguros fiecare pas "
        "al elevului, să construiești arborele de dependență deductivă (AST), să detectezi primul "
        "pas fatal greșit și să aplici regula colapsului în cascadă (orice pas subsecvent ce depinde "
        "de o premisă falsă primește automat 0 puncte).\n"
        "Răspunde întotdeauna structurat în format JSON cu evaluarea fiecărui pas, scorul procentual, "
        "punctajul ONM din 7.0 puncte și o critică pedagogică socratică detaliată în limba română."
    )

    for p in problems:
        # 1. Flawed submission sample
        user_prompt_flawed = (
            f"Evaluează următoarea demonstrație de concurs pentru problema:\n"
            f"Titlu: {p['title']} ({p['domain']})\n"
            f"Enunț: {p['enunt_ro']}\n\n"
            f"Barem oficial (100%):\n"
            + "\n".join(
                f"- Pas {s['step_index']} ({s['weight_percentage']}%): {s['description_ro']}"
                for s in p["rubric_100pct"]
            )
            + "\n\nSoluția elevului de evaluat:\n"
            + "\n".join(
                f"[Pas {i+1}] {step}"
                for i, step in enumerate(p["flawed_submission"]["student_steps_ro"])
            )
        )

        flawed_eval = {
            "status": "flawed",
            "fatal_flaw_step": p["flawed_submission"]["fatal_flaw_step"],
            "cascading_invalidated_steps": p["flawed_submission"]["cascading_invalidated_steps"],
            "final_score_percentage": p["flawed_submission"]["final_score_percentage"],
            "onm_7p_score": p["flawed_submission"]["onm_7p_score"],
            "teacher_critique_ro": p["flawed_submission"]["teacher_critique_ro"],
            "step_evaluations": [
                {
                    "step_index": s["step_index"],
                    "awarded_percentage": (
                        s["weight_percentage"]
                        if s["step_index"] < p["flawed_submission"]["fatal_flaw_step"]
                        else 0.0
                    ),
                    "is_sound": s["step_index"] < p["flawed_submission"]["fatal_flaw_step"],
                    "status_note": (
                        "Valid și demonstrat riguros."
                        if s["step_index"] < p["flawed_submission"]["fatal_flaw_step"]
                        else (
                            "FRACTURĂ LOGICĂ FATALĂ."
                            if s["step_index"] == p["flawed_submission"]["fatal_flaw_step"]
                            else "COLAPS ÎN CASCADĂ (depinde de o premisă invalidată)."
                        )
                    )
                }
                for s in p["rubric_100pct"]
            ]
        }

        sft_data.append({
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt_flawed},
                {"role": "assistant", "content": json.dumps(flawed_eval, ensure_ascii=False, indent=2)}
            ]
        })

        # 2. Sound submission sample
        user_prompt_sound = (
            f"Evaluează următoarea demonstrație de concurs pentru problema:\n"
            f"Titlu: {p['title']} ({p['domain']})\n"
            f"Enunț: {p['enunt_ro']}\n\n"
            f"Barem oficial (100%):\n"
            + "\n".join(
                f"- Pas {s['step_index']} ({s['weight_percentage']}%): {s['description_ro']}"
                for s in p["rubric_100pct"]
            )
            + "\n\nSoluția elevului de evaluat:\n"
            + "\n".join(
                f"[Pas {i+1}] {step}"
                for i, step in enumerate(p["sound_submission"]["student_steps_ro"])
            )
        )

        sound_eval = {
            "status": "sound",
            "fatal_flaw_step": None,
            "cascading_invalidated_steps": [],
            "final_score_percentage": 100.0,
            "onm_7p_score": 7.0,
            "teacher_critique_ro": (
                "DEMONSTRAȚIE IREPROȘABILĂ (7.0 / 7.0p):\n"
                "Toate etapele deductive au fost justificate conform normelor de rigoare ale "
                "Olimpiadei Naționale de Matematică. Nu există goluri logice sau presupuneri implicite. "
                "Punctaj maxim acordat conform baremului."
            ),
            "step_evaluations": [
                {
                    "step_index": s["step_index"],
                    "awarded_percentage": s["weight_percentage"],
                    "is_sound": True,
                    "status_note": "Valid și demonstrat riguros."
                }
                for s in p["rubric_100pct"]
            ]
        }

        sft_data.append({
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt_sound},
                {"role": "assistant", "content": json.dumps(sound_eval, ensure_ascii=False, indent=2)}
            ]
        })

    return sft_data

def main():
    # Dynamically resolve dataset folder to work universally in Google Colab, Linux, macOS, or Cloud
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(base_dir, exist_ok=True)

    # 1. Save master JSON
    master_json_path = os.path.join(base_dir, "olympiad_cascading_failure_ro.json")
    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump(PROBLEMS, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved master dataset: {master_json_path} ({len(PROBLEMS)} problems)")

    # 2. Generate SFT Samples
    sft_samples = generate_sft_samples(PROBLEMS)
    print(f"✓ Generated {len(sft_samples)} SFT training conversations (flawed + sound)")

    # 3. Save sft_chat_instruct.jsonl
    sft_jsonl_path = os.path.join(base_dir, "sft_chat_instruct.jsonl")
    with open(sft_jsonl_path, "w", encoding="utf-8") as f:
        for item in sft_samples:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"✓ Saved full SFT dataset: {sft_jsonl_path}")

    # 4. Train / Val split (85% / 15%)
    random.seed(42)
    shuffled = list(sft_samples)
    random.shuffle(shuffled)
    split_idx = max(1, int(len(shuffled) * 0.85))
    train_data = shuffled[:split_idx]
    val_data = shuffled[split_idx:]

    train_path = os.path.join(base_dir, "train.jsonl")
    val_path = os.path.join(base_dir, "val.jsonl")

    with open(train_path, "w", encoding="utf-8") as f:
        for item in train_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    with open(val_path, "w", encoding="utf-8") as f:
        for item in val_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(f"✓ Saved train split: {train_path} ({len(train_data)} samples)")
    print(f"✓ Saved val split: {val_path} ({len(val_data)} samples)")

    # 5. Validation assertions
    print("\n--- Running Mathematical Rigor Validations ---")
    for p in PROBLEMS:
        p_id = p["problem_id"]
        rubric = p["rubric_100pct"]
        total_pct = sum(s["weight_percentage"] for s in rubric)
        assert abs(total_pct - 100.0) < 1e-6, f"Rubric {p_id} does not sum to 100%!"

        flaw = p["flawed_submission"]
        fatal = flaw["fatal_flaw_step"]
        final_pct = flaw["final_score_percentage"]
        onm_score = flaw["onm_7p_score"]

        sound_sum = sum(s["weight_percentage"] for s in rubric if s["step_index"] < fatal)
        assert abs(sound_sum - final_pct) < 1e-6, f"Score mismatch on {p_id}: {sound_sum} vs {final_pct}"
        expected_onm = round((final_pct / 100.0) * 7.0, 4)
        assert abs(expected_onm - onm_score) < 1e-4, f"ONM score mismatch on {p_id}"
        print(f"  ✓ {p_id}: Rubric 100%, Flaw at Step {fatal}, Score {final_pct}% ({onm_score}/7.0p)")

    print("\nAll mathematical verifications and cascading logic checks passed with 100% accuracy!")

if __name__ == "__main__":
    main()
