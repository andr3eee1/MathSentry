# MathSentry Olympiad Training Dataset

This directory contains the golden dataset for training and fine-tuning the **MathSentry** AI proof verification and pedagogical engine.

## Core Pedagogical Concept: Cascading Logical Collapse

Unlike standard QA or code datasets, mathematical proofs require **deductive tree auditing**:
1. **Dependency Checking**: Each step $N_i$ relies on specific antecedent premises $\{N_{j} \mid j < i\}$.
2. **Cascading Collapse**: If step $k$ contains a fatal logical fracture (e.g. dividing by zero, missing sign condition on inequalities, confusing injectivity with surjectivity), **every downstream step that relies on step $k$ collapses to 0 points**, even if the algebra in downstream steps is mechanically correct.
3. **Universal 100% Barem**: Every proof is scored on a 100% weight rubric, automatically converted to the Romanian National Olympiad barem:
   $$\text{Punctaj ONM} = \frac{\text{Scor}\%}{100} \times 7.0\,\text{p}$$

---

## Dataset Files

| File | Format | Description |
| :--- | :--- | :--- |
| [`olympiad_cascading_failure_ro.json`](olympiad_cascading_failure_ro.json) | JSON | Master dataset with 12 canonical Olympiad problems across Algebra, Number Theory, Geometry, Combinatorics, and Polynomials. Each problem includes the 100% rubric, flawed submission with cascading collapse, and sound 7.0/7.0p proof. |
| [`sft_chat_instruct.jsonl`](sft_chat_instruct.jsonl) | JSONL | Full Supervised Fine-Tuning (SFT) dataset formatted in standard ChatML/OpenAI `{"messages": [{"role": "system"}, {"role": "user"}, {"role": "assistant"}]}` structure. |
| [`train.jsonl`](train.jsonl) | JSONL | Training split (85% of samples) ready for fine-tuning. |
| [`val.jsonl`](val.jsonl) | JSONL | Validation split (15% of samples) for evaluation. |
| [`generate_dataset.py`](generate_dataset.py) | Python | Deterministic dataset generator with mathematical verification assertions. |

---

## Covered Mathematical Domains

1. **Algebră & Inducție**: Inegalitatea lui Bernoulli (`ONM_RO_ALG_BERNOULLI`) — Omiterea condiției $1+x > 0$.
2. **Ecuații Funcționale**: Relații pe $\mathbb{R}$ (`ONM_RO_ALG_FUNC_EQ`) — Confundarea surjectivității cu injectivitatea pe mulțimi infinite.
3. **Inegalități Fracționare**: Lema lui Titu / Cauchy-Schwarz (`ONM_RO_ALG_TITU_LEMMA`) — Condiții de egalitate și numitori nuli.
4. **Ecuații Diofantice**: Exponențiale $2^x + 3^y = z^2$ (`ONM_RO_NT_DIOPH_EXP`) — Omiterea exponentului nul $a = 0$.
5. **Geometrie Sintetică**: Patrulatere inscriptibile și puterea punctului (`ONM_RO_GEOM_CYCLIC_POWER`) — Confundarea proiecțiilor cu înălțimile.
6. **Combinatorică**: Principiul Cutiei / Erdős (`ONM_RO_COMB_ERDOS_DIV`) — Partiționare greșită pe perechi consecutive.
7. **Teoria Numerelor**: Ordin multiplicativ și Fermat (`ONM_RO_NT_FERMAT_ORDER`) — Salt logic nejustificat pe congruențe.
8. **Analiză / Șiruri**: Recurențe neliniare (`ONM_RO_ALG_SEQ_LIMIT`) — Trecerea la limită fără justificarea convergenței.
9. **Inegalități Simetrice**: Nesbitt (`ONM_RO_ALG_NESBITT`) — Substituții asimetrice nejustificate.
10. **Reziduri Pătratice**: Teorema lui Wilson (`ONM_RO_NT_WILSON_QUAD_RESIDUE`) — Circularitate în demonstrații.
11. **Invarianți**: Table $8 \times 8$ (`ONM_RO_COMB_INVARIANT_GRID`) — Algoritm euristic în loc de invariant de semn.
12. **Polinoame**: Rădăcini întregi (`ONM_RO_POLY_INTEGER_ROOTS`) — Argumente false de paritate.

---

## How to Fine-Tune

### Option 1: HuggingFace TRL (SFTTrainer) / Unsloth
```python
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

dataset = load_dataset("json", data_files={"train": "dataset/train.jsonl", "validation": "dataset/val.jsonl"})

trainer = SFTTrainer(
    model="meta-llama/Meta-Llama-3-8B-Instruct", # or mistralai/Mistral-7B-Instruct-v0.3 / Qwen/Qwen2.5-Math-7B-Instruct
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    max_seq_length=2048,
    dataset_text_field="messages",
)
trainer.train()
```

### Option 2: OpenAI Fine-Tuning API
```bash
openai api fine_tuning.jobs.create \
  -t dataset/train.jsonl \
  -v dataset/val.jsonl \
  -m gpt-4o-mini-2024-07-18
```
