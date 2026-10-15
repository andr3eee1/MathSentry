import json
import os

problems = [
    {
        "problem_id": "ONM_RO_ALG_FUNC_EQ",
        "domain": "Algebră / Ecuații Funcționale",
        "title": "Ecuație Funcțională cu Bijectivitate și Domeniu Real",
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
                "dependencies": [1],
                "description_ro": "Deducerea riguroasă a surjectivității (membrul drept y + f(1) acoperă ℝ) și a injectivității: f(y₁) = f(y₂) implică f(f(y₁) + f(1)) = f(f(y₂) + f(1)), de unde y₁ = y₂."
            },
            {
                "step_index": 3,
                "label": "Substituția y = 0 și exploatarea injectivității",
                "weight_percentage": 30.0,
                "dependencies": [2],
                "description_ro": "Efectuarea substituției y = 0 pentru a obține f(x f(0) + f(x)) = f(x), urmată de aplicarea injectivității demonstrate pentru a deduce x f(0) + f(x) = x, adică f(x) = x(1 - f(0))."
            },
            {
                "step_index": 4,
                "label": "Determinarea constantei, unicitatea și verificarea soluției",
                "weight_percentage": 25.0,
                "dependencies": [3],
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
            "cascading_invalidated_steps": [3, 4],
            "final_score_percentage": 20.0,
            "onm_7p_score": 1.4,
            "teacher_critique_ro": "EROARE FATALĂ DE RAȚIONAMENT LA PASUL 2 (CONFUNDAREA SURJECTIVITĂȚII CU INJECTIVITATEA):\nAi obținut corect la Pasul 1 relația f(f(y) + f(1)) = y + f(1) și ai remarcat pe bună dreptate că f este surjectivă, deoarece y + f(1) acoperă întregul corp ℝ când y ∈ ℝ (se acordă integral cele 20% corespunzătoare Pasului 1).\nÎnsă afirmația ta de la Pasul 2: 'Fiind o funcție surjectivă pe o mulțime numerică, f este automat și injectivă' reprezintă o eroare logică gravă, inacceptabilă la nivel de olimpiadă!\nPe mulțimi infinite (cum este ℝ), surjectivitatea NU implică nicidecum injectivitatea (echivalența dintre injectivitate și surjectivitate este valabilă exclusiv pentru endomorfisme pe spații finit dimensionale sau funcții pe mulțimi finite).\nContraexemplu elementar: Funcția g: ℝ → ℝ, g(t) = t³ - t este evident continuă și surjectivă pe ℝ (limitele la ±∞ sunt ±∞), dar nu este injectivă, având rădăcinile distincte g(-1) = g(0) = g(1) = 0.\nMecanismul de colaps în cascadă (Cascading Proof Failure):\nPasul 2 primește 0% din cauza fracturii logice. Deoarece injectivitatea lui f nu a fost demonstrată, aplicarea la Pasul 3 a proprietății f(u) = f(v) ⟹ u = v pentru a reduce f(x f(0) + f(x)) = f(x) la x f(0) + f(x) = x este complet nevalidă. Întregul raționament de la Pasul 3 se prăbușește în cascadă la 0%. Mai departe, forma liniară f(x) = x obținută la Pasul 4 derivă direct dintr-o premisă nedovedită, astfel că și Pasul 4 colapsează la 0%.\nCum se remediază demonstrația pentru punctaj maxim (7.0 / 7p):\nInjectivitatea trebuia dedusă direct din ecuația f(f(y) + f(1)) = y + f(1): dacă f(y₁) = f(y₂), atunci f(y₁) + f(1) = f(y₂) + f(1), iar aplicând funcția f ambilor membri obținem f(f(y₁) + f(1)) = f(f(y₂) + f(1)), de unde y₁ + f(1) = y₂ + f(1), deci y₁ = y₂."
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
        "problem_id": "ONM_RO_NT_DIOPH_EXP",
        "domain": "Teoria Numerelor / Ecuații Diofantice Exponențiale",
        "title": "Ecuație Diofantică Exponențială în Numere Naturale Nenule",
        "enunt_ro": "Să se determine toate tripletele de numere naturale nenule $(x, y, z) \\in (\\mathbb{N}^*)^3$ care satisfac ecuația diofantică:\n$$2^x + 3^y = z^2.$$",
        "rubric_100pct": [
            {
                "step_index": 1,
                "label": "Analiza modulo 3 și paritatea lui x",
                "weight_percentage": 25.0,
                "dependencies": [],
                "description_ro": "Analiza ecuației modulo 3: justificarea că 3 nu divide z (altfel 3 divide 2^x), deducerea că z² ≡ 1 (mod 3), ceea ce impune 2^x ≡ 1 (mod 3), deci x este par, x = 2k (k ≥ 1)."
            },
            {
                "step_index": 2,
                "label": "Factorizarea în ℤ ca diferență de pătrate",
                "weight_percentage": 25.0,
                "dependencies": [1],
                "description_ro": "Scrierea ecuației sub forma (z - 2^k)(z + 2^k) = 3^y și identificarea factorilor ca puteri ale lui 3: z - 2^k = 3^a și z + 2^k = 3^b, cu a < b și a + b = y."
            },
            {
                "step_index": 3,
                "label": "Eliminarea lui z și demonstrarea că a = 0",
                "weight_percentage": 25.0,
                "dependencies": [2],
                "description_ro": "Obținerea relației 2^(k+1) = 3^a(3^(b-a) - 1) prin scădere și demonstrarea riguroasă că a = 0 (deoarece dacă a ≥ 1, 3 ar divide 2^(k+1), imposibil)."
            },
            {
                "step_index": 4,
                "label": "Rezolvarea ecuației 3^y - 1 = 2^(k+1), unicitatea și soluția (4, 2, 5)",
                "weight_percentage": 25.0,
                "dependencies": [3],
                "description_ro": "Analiza parității lui y modulo 4 sau factorizare, excluderea cazurilor imposibile, determinarea soluției unice (x, y, z) = (4, 2, 5) și verificarea ei în ecuația inițială."
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
            "cascading_invalidated_steps": [4],
            "final_score_percentage": 50.0,
            "onm_7p_score": 3.5,
            "teacher_critique_ro": "EROARE FATALĂ DE TEORIA NUMERELOR LA PASUL 3 (OMISIUNEA EXPONENTULUI NUL a = 0):\nAi realizat o primă parte excelentă: deducerea parității lui x (x = 2k) prin congruență modulo 3 la Pasul 1 (25%) și factorizarea corectă în ℤ ca diferență de pătrate la Pasul 2 (25%) sunt ireproșabile.\nÎnsă la Pasul 3 comiți o eroare clasică și catastrofală de olimpiadă: afirmi că '3^a este o putere a lui 3, deci este un multiplu de 3'. Ai omis complet cazul exponențial nul a = 0!\nPentru a = 0, avem 3^a = 3^0 = 1. Numărul 1 NU este multiplu de 3 și divide orice număr întreg, inclusiv puterile lui 2 (1 | 2^(k+1))!\nMecanismul de colaps în cascadă (Cascading Proof Failure):\nPasul 3 este invalidat complet (0%) deoarece a declarat ecuația imposibilă pe baza unei premise false. În consecință directă, Pasul 4 (care trebuia să rezolve ecuația 2^(k+1) = 3^y - 1 și să determine soluția unică) colapsează la 0%: ai concluzionat în mod eronat că nu există soluții, 'omorând' tocmai soluția autentică a problemei (4, 2, 5)! O concluzie eronată dedusă dintr-un pas fals anulează tot ce urmează.\nCum se remediază demonstrația pentru punctaj maxim (7.0 / 7p):\nTrebuia să observi că dacă a ≥ 1, atunci într-adevăr 3 | 2^(k+1), ceea ce este imposibil. De aici rezultă OBLIGATORIU că a = 0! Atunci z - 2^k = 1 și 2^(k+1) = 3^y - 1. Pentru y = 2 obții 2^(k+1) = 8 ⟹ k+1 = 3 ⟹ k = 2, deci x = 4 și z = 5. Pentru y ≥ 3, analiza modulo 4 (y impar) și factorizarea 3^(2m) - 1 = (3^m - 1)(3^m + 1) (y par) arată că nu mai există alte soluții, obținând soluția unică (x, y, z) = (4, 2, 5)."
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
        "title": "Patrulatere Inscriptibile și Puterea Punctului pe Înălțimi",
        "enunt_ro": "Fie $ABC$ un triunghi ascuțitunghic cu $AB \\neq AC$. Fie $AD$ înălțimea din $A$ pe $BC$ ($D \\in BC$). Fie $E$ și $F$ proiecțiile ortogonale ale punctului $D$ pe laturile $AB$, respectiv $AC$. Dreapta $EF$ intersectează dreapta $BC$ în punctul $P$. Să se demonstreze că:\na) Patrulaterul $AEDF$ este inscriptibil, având diametrul $AD$.\nb) Patrulaterul $BCEF$ este inscriptibil.\nc) Are loc egalitatea $PD^2 = PE \\cdot PF = PB \\cdot PC$.",
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
                "dependencies": [1],
                "description_ro": "Aplicarea teoremei catetei în triunghiurile dreptunghice ADB și ADC pentru a obține AE · AB = AD² = AF · AC, demonstrând că ΔAEF ~ ΔACB și patrulaterul BCEF este inscriptibil."
            },
            {
                "step_index": 3,
                "label": "Calculul puterii punctului P față de cercurile C₁ și C₂",
                "weight_percentage": 30.0,
                "dependencies": [1, 2],
                "description_ro": "Justificarea că BC este tangenta în D la cercul C₁ (deoarece AD ⊥ BC și AD este diametru), deci PD² = PE · PF; aplicarea puterii punctului P față de cercul circumscris lui BCEF pentru a deduce PE · PF = PB · PC."
            },
            {
                "step_index": 4,
                "label": "Egalitatea tranzitivă și concluzia finală",
                "weight_percentage": 20.0,
                "dependencies": [3],
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
            "cascading_invalidated_steps": [3, 4],
            "final_score_percentage": 20.0,
            "onm_7p_score": 1.4,
            "teacher_critique_ro": "EROARE FATALĂ DE GEOMETRIE LA PASUL 2 (CONFUNDAREA PROIECȚIILOR CU ÎNĂLȚIMILE TRIUNGHIULUI):\nLa Pasul 1 ai demonstrat corect inscriptibilitatea lui AEDF în cercul de diametru AD (20%).\nÎnsă la Pasul 2 comiți o eroare de raționament fatală: confunzi proiecțiile ortogonale E și F ale punctului D cu picioarele înălțimilor din C, respectiv B ale triunghiului ABC! Afirmația ta conform căreia 'segmentele BE și CF sunt înălțimi, deci ∠BEC = 90° și ∠BFC = 90°' este complet falsă. În ipoteza problemei, DE ⊥ AB și DF ⊥ AC. Dreapta CF nu este perpendiculară pe AB, iar unghiurile ∠BEC și ∠BFC nu au 90° (dacă ar avea 90°, punctele E și D ar coincide, ceea ce ar forța ABC să fie dreptunghic, contrazicând ipoteza că este ascuțitunghic neisoscel).\nMecanismul de colaps în cascadă (Cascading Proof Failure):\nPasul 2 este anulat integral (0%). Întrucât inscriptibilitatea patrulaterului BCEF a fost 'demonstrată' pe baza unei iluzii optice și a unei confuzii flagrante, cercul circumscris lui BCEF de diametru BC nu există în realitate. În consecință, aplicarea teoremei puterii punctului la Pasul 3 pentru a deduce PE · PF = PB · PC este complet lipsită de bază geometrică. Pasul 3 colapsează în cascadă la 0%. Mai departe, Pasul 4 (egalitatea tranzitivă) depinde nemijlocit de cele două puteri din Pasul 3, prăbușindu-se la rândul său la 0%.\nCum se remediază demonstrația pentru punctaj maxim (7.0 / 7p):\nInscriptibilitatea lui BCEF trebuia demonstrată riguros prin teorema catetei în triunghiurile dreptunghice ADB și ADC: AD² = AE · AB și AD² = AF · AC. De aici rezultă AE · AB = AF · AC ⟺ AE / AC = AF / AB. Având unghiul ∠BAC comun, triunghiurile ΔAEF și ΔACB sunt asemenea (criteriul LUL), de unde ∠AEF = ∠ACB, ceea ce demonstrează că patrulaterul BCEF este inscriptibil."
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
                "dependencies": [1],
                "description_ro": "Scrierea oricărui x ∈ S sub forma unică x = 2^k · m (cu m impar), arătând că părțile impare aparțin mulțimii M = {1, 3, ..., 2n - 1} de cardinal n, definind cutiile C_m = {2^k · m ∈ S | k ≥ 0}."
            },
            {
                "step_index": 3,
                "label": "Aplicarea Principiului Cutiei (Dirichlet)",
                "weight_percentage": 25.0,
                "dependencies": [2],
                "description_ro": "Aplicarea principiului lui Dirichlet: plasarea celor n + 1 elemente din A în cele n cutii C_m garantează existența a două elemente distincte a, b ∈ A aparținând aceleiași cutii C_m (aceeași parte impară m)."
            },
            {
                "step_index": 4,
                "label": "Deducerea riguroasă a divizibilității a | b",
                "weight_percentage": 25.0,
                "dependencies": [3],
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
            "cascading_invalidated_steps": [3, 4],
            "final_score_percentage": 20.0,
            "onm_7p_score": 1.4,
            "teacher_critique_ro": "EROARE FATALĂ DE COMBINATORICĂ LA PASUL 2 (PARTIȚIONARE GREȘITĂ ȘI FALSA DIVIZIBILITATE 2k - 1 | 2k):\nAi enunțat corect la Pasul 1 intenția de a folosi principiul cutiei prin împărțirea mulțimii S în n clase (20%).\nÎnsă la Pasul 2 comiți o confuzie devastatoare între problema numerelor prime între ele și problema divizibilității! Împărțirea în n perechi de numere consecutive {1, 2}, {3, 4}, ..., {2n - 1, 2n} funcționează exclusiv pentru a demonstra existența a două numere prime între ele (deoarece cmmdc(2k - 1, 2k) = 1). Pentru divizibilitate, această partiționare este complet catastrofală: două numere consecutive din aceeași cutie NU se divid niciodată, cu excepția cazului banal k = 1 ({1, 2})!\nContraexemplu flagrant: Pentru k = 2, cutia este {3, 4}, însă 3 nu divide pe 4 (4 / 3 ∉ ℤ). Pentru k = 3, cutia este {5, 6}, iar 5 nu divide pe 6. În general, cmmdc(2k - 1, 2k) = 1, deci 2k - 1 nu divide 2k pentru niciun k ≥ 2.\nMecanismul de colaps în cascadă (Cascading Proof Failure):\nPasul 2 este anulat complet (0%) deoarece cutiile construite nu satisfac proprietatea cerută de problemă. Din acest motiv, Pasul 3 (care aplică principiul cutiei pe această partiție defectuoasă) este lipsit de orice relevanță matematică și primește 0%. Mai grav, la Pasul 4 afirmi senin că '2k - 1 | 2k', o falsitate matematică grosolană, ceea ce prăbușește Pasul 4 la 0%.\nCum se remediază demonstrația pentru punctaj maxim (7.0 / 7p):\nCutiile trebuiau construite folosind descompunerea unică în factori a fiecărui număr x sub forma x = 2^k · m, unde m este număr impar. Numerele impare din S sunt {1, 3, 5, ..., 2n - 1}, în număr exact de n. Cutiile sunt lanțurile C_m = {m, 2m, 4m, 8m, ...} ∩ S. În oricare astfel de cutie, elementele sunt multipli de puteri ale lui 2 ale aceluiași număr impar m, garantând că dacă a, b ∈ C_m cu a < b, atunci a | b."
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
    }
]

output_path = "/home/andrei/MathSentry/dataset/olympiad_cascading_failure_ro.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(problems, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {len(problems)} problems to {output_path}")

# Verification of constraints
for p in problems:
    p_id = p["problem_id"]
    rubric = p["rubric_100pct"]
    total_pct = sum(step["weight_percentage"] for step in rubric)
    print(f"Checking {p_id}: Rubric total = {total_pct}%")
    assert abs(total_pct - 100.0) < 1e-6, f"Rubric for {p_id} does not sum to 100%!"
    
    flaw = p["flawed_submission"]
    fatal_step = flaw["fatal_flaw_step"]
    cascaded = flaw["cascading_invalidated_steps"]
    final_pct = flaw["final_score_percentage"]
    onm_score = flaw["onm_7p_score"]
    
    # Calculate sum of sound steps
    sound_steps_pct = sum(s["weight_percentage"] for s in rubric if s["step_index"] < fatal_step)
    print(f"  Fatal step: {fatal_step}, Cascaded steps: {cascaded}")
    print(f"  Earned pct expected: {sound_steps_pct}%, in JSON: {final_pct}%")
    assert abs(sound_steps_pct - final_pct) < 1e-6, f"Score mismatch for {p_id}!"
    expected_onm = round((final_pct / 100.0) * 7.0, 4)
    print(f"  ONM score expected: {expected_onm}, in JSON: {onm_score}")
    assert abs(expected_onm - onm_score) < 1e-4, f"ONM score mismatch for {p_id}!"

print("All verifications passed flawlessly!")
