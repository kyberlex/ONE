# SIM-QA-30: Seed Node at Capacity (synthetic, uncalibrated)

`python3 sim_qa_30_seed_node_capacity.py`

Node of 60, 80% contributing; capacity K = 1.2 x N0 = 72 rations a day; reserve 180 days; floor 30 days of current population; entry period 4 weeks; core hospitality 7 nights; transfer acceptance 50%.

## 1. Day the reserve falls below the 30-day floor (R = 2 rations per contributor a day)

| Arrivals a week | Arrivals who contribute (G) | P0 open | P1 residence cap only | P2 network | P34 core + referral | P234 |
| ---: | ---: | :--- | :--- | :--- | :--- | :--- |
| 1 | 20% | day 408 | day 408 | day 556 | holds 2 years | holds 2 years |
| 1 | 50% | day 408 | day 408 | day 556 | holds 2 years | holds 2 years |
| 1 | 80% | day 408 | day 408 | day 556 | holds 2 years | holds 2 years |
| 3 | 20% | day 198 | day 198 | day 281 | holds 2 years | holds 2 years |
| 3 | 50% | day 198 | day 198 | day 281 | holds 2 years | holds 2 years |
| 3 | 80% | day 198 | day 198 | day 281 | holds 2 years | holds 2 years |
| 10 | 20% | day 89 | day 89 | day 134 | holds 2 years | holds 2 years |
| 10 | 50% | day 89 | day 89 | day 134 | holds 2 years | holds 2 years |
| 10 | 80% | day 89 | day 89 | day 134 | holds 2 years | holds 2 years |

## 2. Persons referred and transferred over two years (R = 2, G = 50%)

| Arrivals a week | Policy | Referred to legacy services | Transferred to other seed nodes | Population at end or at failure |
| ---: | :--- | ---: | ---: | ---: |
| 1 | P0 | 0 | 0 | 119 |
| 1 | P2 | 0 | 34 | 106 |
| 1 | P34 | 92 | 0 | 73 |
| 1 | P234 | 46 | 46 | 72 |
| 3 | P0 | 0 | 0 | 147 |
| 3 | P2 | 0 | 56 | 128 |
| 3 | P34 | 300 | 0 | 75 |
| 3 | P234 | 150 | 152 | 74 |
| 10 | P0 | 0 | 0 | 190 |
| 10 | P2 | 0 | 95 | 165 |
| 10 | P34 | 1030 | 0 | 80 |
| 10 | P234 | 515 | 520 | 75 |

## 3. Sensitivity to output per contributor R (arrivals 3 a week, G = 50%)

| R | P0 open | P34 core + referral |
| ---: | :--- | :--- |
| 1.25 | day 192 | holds 2 years |
| 1.5 | day 198 | holds 2 years |
| 2.0 | day 198 | holds 2 years |
| 3.0 | day 198 | holds 2 years |

## 4. When labour binds: installed capacity 3 x N0, R = 1.25, open node (P0)

| Arrivals a week | G = 20% | G = 50% | G = 80% |
| ---: | :--- | :--- | :--- |
| 1 | day 360 | day 464 | holds 2 years |
| 3 | day 189 | day 230 | day 349 |
| 10 | day 86 | day 96 | day 112 |

## 5. Sensitivity to core hospitality nights T (policy P34, R = 2, G = 50%; entry period 4 or 8 weeks gives the same result here)

| T nights | Arrivals a week | Result | Referred over two years or until failure |
| ---: | ---: | :--- | ---: |
| 7 | 3 | holds 2 years | 300 |
| 7 | 10 | holds 2 years | 1030 |
| 14 | 3 | holds 2 years | 297 |
| 14 | 10 | day 461 | 630 |
| 30 | 3 | day 686 | 270 |
| 30 | 10 | day 196 | 230 |

P1 consumes as P0 by construction: a cap on residence does not cap what guests eat.
