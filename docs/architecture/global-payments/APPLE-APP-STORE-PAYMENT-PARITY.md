# OpenStore Apple App Store Payment Parity Plan

## Scope

This document maps OpenStore's customer-facing payment methods to the payment methods that Apple officially lists for the App Store in the target markets reviewed on March 21, 2026 (Asia/Seoul).

The goal is to mimic Apple's country-by-country payment surface as closely as possible where that is commercially and legally feasible.

## Important Constraint

OpenStore should not copy Apple's payment stack literally.

OpenStore should copy the **customer-visible payment method mix**, not Apple's proprietary instruments or Apple-specific legal structure.

Use these mappings:

- `Apple Account balance` -> `OpenStore balance`
- `Apple Gift Card / App Store Card` -> `OpenStore gift balance or prepaid code`
- `Apple Pay` -> `Apple Pay`
- `Most credit and debit cards` -> `major credit and debit cards`
- `Mobile phone billing` -> `carrier billing`
- `Apple Card` -> `treat as card coverage, not a separate OpenStore feature`
- `Apple Cash` -> `do not copy literally; cover via OpenStore balance or card rails`

## Parity Rules

1. If Apple supports a mainstream method in a market, OpenStore should target it.
2. If Apple supports a local wallet in a market, OpenStore should add it only if the PSP and compliance model support it.
3. If Apple supports carrier billing in a market, OpenStore should treat that as a parity target, not an initial prerequisite.
4. If Apple supports Apple-only instruments, OpenStore should cover the economic role, not the brand-specific product.
5. EU payment parity must be implemented per member state, not as a single EU-wide method bundle.

## Payment Parity Matrix

| Market | Apple-listed App Store payment methods | OpenStore parity target |
| --- | --- | --- |
| United States | Apple Account balance, Apple Card, Apple Cash, Apple Pay, most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal |
| Canada | Apple Account balance, Apple Pay, most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal |
| United Kingdom | Apple Account balance, Apple Pay, mobile phone billing (`3Pay`, `EE`, `O2`, `Vodafone`), most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal, carrier billing |
| Australia | Apple Account balance, Apple Pay, most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal |
| New Zealand | Apple Account balance, most credit and debit cards | OpenStore balance, cards |
| Iceland | Apple Pay, most credit and debit cards | Apple Pay, cards |
| France | Apple Account balance, Apple Pay, mobile phone billing (`Bouygues Telecom`, `Orange`, `SFR`), most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal, carrier billing |
| Germany | Apple Account balance, Apple Pay, mobile phone billing (`O2 and partner brands`, `Telekom`, `Vodafone`), most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal, carrier billing |
| Austria | Apple Account balance, Apple Pay, `EPS` for adding funds only, mobile phone billing (`A1`, `Drei`, `T-Mobile`), most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal, carrier billing, optional local bank transfer for balance top-ups |
| Belgium | Apple Account balance, Apple Pay, `Bancontact`, mobile phone billing (`BASE-PayByMobile`, `Orange`, `Proximus`, `Telenet`), most credit and debit cards, PayPal | OpenStore balance, Apple Pay, cards, PayPal, Bancontact, carrier billing |
| South Korea | `kakaopay`, mobile phone billing (`KT`, `LG U+`, `SK Telecom`), most credit and debit cards, `Naver Pay`, `PAYCO`, `Toss Pay` | Cards, KakaoPay, Naver Pay, PAYCO, Toss Pay, carrier billing |
| Japan | Apple Account balance, Apple Pay, `Merpay`, mobile phone billing (`au`, `NTT DOCOMO`, `SoftBank`), most credit and debit cards, `PayPay` | OpenStore balance, Apple Pay, cards, PayPay, Merpay, carrier billing |
| China mainland | `Alipay`, Apple Account balance, `Douyin Pay`, most credit and debit cards, `WeChat Pay` | OpenStore balance, cards, Alipay, WeChat Pay, optional Douyin Pay if a local partner supports it |
| India | Apple Account balance, `Net Banking` for adding funds only, `UPI` | OpenStore balance, UPI, optional net-banking top-up for balance |
| United Arab Emirates | Apple Account balance, Apple Pay, mobile phone billing (`Du`, `Etisalat`), most credit and debit cards | OpenStore balance, Apple Pay, cards, carrier billing |
| Saudi Arabia | Apple Account balance, mobile phone billing (`Mobily`, `STC`, `Zain`), most credit and debit cards | OpenStore balance, cards, carrier billing |
| Vietnam | Apple Account balance, `MoMo`, most credit and debit cards, `ShopeePay`, `VNPAY`, `ZaloPay` | OpenStore balance, cards, MoMo, ShopeePay, VNPAY, ZaloPay |
| Thailand | Mobile phone billing (`AIS`, `dtac`, `TrueMove`), most credit and debit cards, `ShopeePay`, `TrueMoney` | Cards, ShopeePay, TrueMoney, carrier billing |
| Indonesia | Apple Account balance, `DANA`, `GoPay`, most credit and debit cards, `ShopeePay` | OpenStore balance, cards, DANA, GoPay, ShopeePay |
| Philippines | `GCash`, mobile phone billing (`Smart`), most credit and debit cards, `ShopeePay` | Cards, GCash, ShopeePay, carrier billing |
| Russia | Apple Account balance, mobile phone billing (`Beeline`, `MTS`) | OpenStore balance, carrier billing only if sanctions, PSP access, and legal review explicitly allow it |

## Recommended Delivery Buckets

### Bucket A: Immediate Parity Targets

Launch first where Apple parity mostly means cards, Apple Pay, PayPal, or store balance:

- United States
- Canada
- United Kingdom
- Australia
- New Zealand
- Iceland
- France
- Germany

### Bucket B: Next Parity Targets

Add markets where parity requires one or two local methods plus carrier billing:

- Austria
- Belgium
- Japan
- South Korea
- India
- United Arab Emirates
- Saudi Arabia

### Bucket C: Complex Local Wallet Markets

Add only with explicit local-wallet and compliance readiness:

- China mainland
- Vietnam
- Thailand
- Indonesia
- Philippines

### Bucket D: Restricted or Special Review

- Russia

## Product Rules OpenStore Should Follow

### 1. Cards

Cards should be the default baseline wherever Apple lists "most credit and debit cards."

### 2. Apple Pay

Support Apple Pay anywhere Apple lists it.
Do not expose Apple Pay on Android surfaces.

### 3. Store Balance

OpenStore balance should exist anywhere Apple supports Apple Account balance, gift redemption, or adding funds.

### 4. Carrier Billing

Treat carrier billing as market-specific and carrier-specific.
Do not show carrier billing unless the exact country, carrier, and product type are all eligible.

### 5. Local Wallets

Only enable local wallets where Apple lists them and OpenStore has both:

- PSP support
- legal/compliance readiness

### 6. Country-Level Configuration

Model payment methods per country, not per region only.
The EU must remain country-specific because Apple's mix differs materially between markets such as Austria, Belgium, France, and Germany.

## OpenStore Configuration That Follows Apple Parity

OpenStore should configure payment methods by country in this order:

1. store balance
2. Apple Pay where applicable
3. cards
4. PayPal where Apple supports it
5. carrier billing where Apple supports it
6. local wallets where Apple supports them

## Engineering Implications

To support Apple-style parity, OpenStore needs:

- country-level payment method configuration
- platform-level filtering for Apple Pay and Google Pay
- carrier-level eligibility rules
- stored-value balance support
- local-wallet routing by PSP and country
- subscription-specific filtering so one-time-only methods do not appear for recurring products

## Sources

Primary Apple source reviewed:

- Apple Support, "Payment methods that you can use with your Apple Account"
  - https://support.apple.com/en-us/111741

Supporting Apple source reviewed:

- Apple Support, "About billing and purchases in Europe and Japan"
  - https://support.apple.com/en-us/108103
