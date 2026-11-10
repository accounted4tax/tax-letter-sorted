#!/usr/bin/env python3
"""Builds the SEO letter pages (/letters/*.html) for Tax Letter Sorted.
Usage: python3 build_letters.py <repo_root>"""
import json, sys, html, os, re

ROOT = sys.argv[1]
BASE = "https://taxletters.accounted4tax.co.uk"
CSS_V = "20261110b"  # bump when css/app.css changes, so browsers load the new styles
CHECKED = "10 November 2026"

PAGES = []

def page(**kw):
    PAGES.append(kw)

# ---------------------------------------------------------------- 1
page(
 slug="hmrc-100-late-filing-penalty",
 chip="£100 late filing penalty",
 title="HMRC £100 late filing penalty: what it means and how to appeal",
 meta_title="HMRC £100 late filing penalty – what it means and how to appeal | Tax Letter Sorted",
 desc="Got a £100 Self Assessment late filing penalty from HMRC? What it means, what happens if you ignore it, when HMRC accepts a reasonable excuse, and how to appeal with form SA370.",
 lead="HMRC charges a fixed £100 penalty when your Self Assessment tax return arrives after the deadline. It applies even if you owe no tax, or paid your tax on time.",
 facts=[("Penalty","£100, fixed"),("Online return deadline","31 January after the end of the tax year (paper: 31 October)"),("Time to appeal","30 days from the date on the penalty notice"),("Time to pay","30 days from the date on the penalty notice, if you don't appeal")],
 body="""
<h2>Why you got this letter</h2>
<p>The letter (often form SA326D) means HMRC did not receive your tax return by the deadline. For an online return that is 31 January after the end of the tax year, so a 2024-25 return was due by 31 January 2026.</p>
<p>The £100 is charged whether or not you owe tax. If you had no income to report, it is still charged unless HMRC agrees you didn't need to send a return.</p>
<h3>Check it before you pay</h3>
<ul class="list">
<li><b>You filed on time?</b> Find your online submission receipt. If it shows the return arrived before the deadline, HMRC may have made a mistake and you can appeal with that proof.</li>
<li><b>HMRC asked you late?</b> If HMRC sent the notice to file after 31 October, your deadline is 3 months from the date of that notice, not 31 January.</li>
<li><b>You didn't need a return?</b> If you shouldn't have been in Self Assessment for that year, ask HMRC to cancel the return and the penalty.</li>
</ul>

<h2>What happens if you do nothing</h2>
<p>The £100 is only the start. If the return is still not filed:</p>
<table class="tbl"><thead><tr><th>Return late by</th><th>Extra penalty</th></tr></thead><tbody>
<tr><td>3 months</td><td>£10 a day for up to 90 days (up to £900)</td></tr>
<tr><td>6 months</td><td>5% of the tax due or £300, whichever is greater</td></tr>
<tr><td>12 months</td><td>Another 5% of the tax due or £300, whichever is greater</td></tr>
</tbody></table>
<p>So the most useful thing you can do straight away is <b>file the return</b>, even before you deal with the penalty. <a href="self-assessment-daily-6-12-month-penalties.html">More about the daily, 6-month and 12-month penalties</a>.</p>

<h2>Can you appeal?</h2>
<p>HMRC cancels the penalty if you had a <b>reasonable excuse</b>: something unexpected or outside your control stopped you filing on time, and you filed as soon as you could once it was over.</p>
<p>Examples HMRC gives include:</p>
<ul class="list">
<li>a partner or close relative died shortly before the deadline</li>
<li>an unexpected stay in hospital, or a serious or life-threatening illness</li>
<li>your computer or software failed while you were preparing the return</li>
<li>HMRC's online services were not working</li>
<li>a fire, flood or theft stopped you completing the return</li>
</ul>
<p>These usually <b>don't</b> count: finding the online system too hard, not getting a reminder from HMRC, or not being able to pay. HMRC's full list is on <a href="https://www.gov.uk/tax-appeals/reasonable-excuses" rel="nofollow">GOV.UK</a>.</p>
<p>Your appeal has to be true and based on what actually happened. We never suggest a reason for you – we only use the facts you confirm.</p>

<h2>How to appeal</h2>
<ol class="list">
<li><b>File the return first</b> if you haven't already.</li>
<li><b>Appeal within 30 days</b> of the date on the penalty notice. A later appeal can still be accepted if you explain why it is late.</li>
<li><b>Choose how to send it:</b> online through HMRC's appeal service, or on form <b>SA370</b> by post to: Self Assessment, HM Revenue and Customs, BX9 1AS.</li>
<li><b>Include dates and evidence</b>: when the problem started and ended, when you filed, and anything that backs it up (for example a hospital letter).</li>
</ol>
<p>You don't have to pay the penalty while HMRC looks at your appeal. If the appeal is refused, you'll owe interest from the original due date. If you disagree with HMRC's decision, you can ask for a review or go to the tax tribunal.</p>
""",
 help="""<p>Upload your penalty notice and we explain it in plain English or Romanian, with your exact deadlines – free. If your reason is one HMRC may accept, you choose how to appeal:</p><ul class="list"><li><b>Free</b> – appeal online yourself: copy and paste our wording (needs your HMRC sign&#8209;in).</li><li><b>£19</b> – we fill in the official SA370; you print, sign and post it.</li><li><b>£39</b> – a qualified accountant reviews your appeal first.</li></ul>""",
 faq=[
  ("Do I have to pay the £100 if I owe no tax?","Yes. The penalty is for sending the return late, not for paying late, so it applies even if no tax is due. If you didn't need to send a return at all, you can ask HMRC to cancel it."),
  ("Can I appeal after 30 days?","Yes. HMRC can accept a late appeal if you explain why you couldn't appeal on time, for example because you were in hospital."),
  ("I filed on time but still got the penalty. What should I do?","Keep your online submission receipt and appeal, saying the return was received on time. HMRC should cancel the penalty if its records are wrong."),
  ("Is being too busy or forgetting a reasonable excuse?","Usually not. HMRC looks for something unexpected or outside your control that stopped you filing, and expects you to file as soon as the problem was over."),
 ],
 sources=[("Self Assessment penalties (GOV.UK)","https://www.gov.uk/self-assessment-tax-returns/penalties"),("Reasonable excuses (GOV.UK)","https://www.gov.uk/tax-appeals/reasonable-excuses"),("How to appeal late filing and late payment penalties – SA370 (GOV.UK)","https://www.gov.uk/government/publications/self-assessment-appeal-against-penalties-for-late-filing-and-late-payment-sa370")],
)

# ---------------------------------------------------------------- 2
page(
 slug="self-assessment-daily-6-12-month-penalties",
 chip="Daily, 6 and 12-month penalties",
 title="HMRC daily penalties and 6 and 12-month late filing penalties",
 meta_title="HMRC £10 daily penalty, 6-month and 12-month late filing penalties | Tax Letter Sorted",
 desc="HMRC letter about £10 a day, £300 or 5% penalties for a late Self Assessment return? How the daily, 6-month and 12-month penalties work and how to appeal them on one SA370.",
 lead="If your Self Assessment return is more than 3 months late, HMRC adds more penalties on top of the £100: £10 a day, then 5% or £300 at 6 months, and again at 12 months.",
 facts=[("Letter","Notice of penalty assessment (form SA370)"),("3 months late","£10 a day for up to 90 days – maximum £900"),("6 months late","5% of the tax due or £300, whichever is greater"),("12 months late","Another 5% of the tax due or £300, whichever is greater"),("Time to appeal","30 days from the date on the penalty notice")],
 body="""
<h2>How the penalties build up</h2>
<p>For an online return due on 31 January, the timeline looks like this if the return is still not filed:</p>
<table class="tbl"><thead><tr><th>Return late by</th><th>Penalty</th><th>Running total (at least)</th></tr></thead><tbody>
<tr><td>1 day</td><td>£100</td><td>£100</td></tr>
<tr><td>3 months</td><td>£10 a day for up to 90 days</td><td>£1,000</td></tr>
<tr><td>6 months</td><td>5% of the tax due or £300</td><td>£1,300</td></tr>
<tr><td>12 months</td><td>Another 5% of the tax due or £300</td><td>£1,600</td></tr>
</tbody></table>
<p>The daily penalties stop once 90 days have been charged. Late payment penalties and interest are separate, on top of these.</p>

<h2>If your return still isn't filed</h2>
<p>For the 6-month and 12-month penalties, HMRC works out the tax it thinks you owe and bases the 5% on that estimate. Filing the return replaces the estimate with your real figures, which can lower these penalties – and it stops the 12-month penalty if you file before then.</p>
<p>At 12 months the penalty can be much higher than 5% if HMRC believes information was deliberately held back. That needs an accountant, not a self-help appeal.</p>

<h2>Check the letter</h2>
<ul class="list">
<li><b>Dates:</b> if you filed less than 3 months after the deadline, you shouldn't have daily penalties. If you have them anyway, HMRC may have made a mistake.</li>
<li><b>Amount:</b> the 6 and 12-month penalties should be £300, or 5% of the tax due if that is higher. A much bigger figure needs checking.</li>
<li><b>Same tax year:</b> all the late filing penalties for one tax year – including the £100 – can go on <b>one SA370</b>, which has a section for each penalty.</li>
</ul>

<h2>Can you appeal?</h2>
<p>The test is the same as for the £100 penalty: a <b>reasonable excuse</b> that lasted through the period and stopped you filing, and filing as soon as you could afterwards. For long delays, HMRC looks closely at the whole period – a short illness won't explain a return that was 9 months late.</p>
<p>Examples HMRC gives include a death in the family shortly before the deadline, an unexpected hospital stay or serious illness, failure of your computer or of HMRC's online services, and fire, flood or theft. See the <a href="https://www.gov.uk/tax-appeals/reasonable-excuses" rel="nofollow">full list on GOV.UK</a>.</p>

<h2>How to appeal</h2>
<ol class="list">
<li>File the return if it isn't filed yet.</li>
<li>Appeal within 30 days of the date on each penalty notice (later appeals need a reason for the delay).</li>
<li>Appeal online, or post form SA370 to: Self Assessment, HM Revenue and Customs, BX9 1AS.</li>
<li>Give dates for when the problem started and ended, and say what evidence you have.</li>
</ol>
""",
 help="""<p>Upload your penalty letters – free explanation of each one, the deadlines and the totals. If an appeal is possible, you choose how to appeal:</p><ul class="list"><li><b>Free</b> – appeal online yourself: copy and paste our wording (needs your HMRC sign&#8209;in).</li><li><b>£19</b> – we fill in one SA370 for all that year's penalties; you print, sign and post it.</li><li><b>£39</b> – a qualified accountant reviews your appeal first.</li></ul><p>Same price whatever the amount.</p>""",
 faq=[
  ("When do HMRC daily penalties start?","Once the return is 3 months late. For a return due on 31 January, that is from 1 May. They run at £10 a day for up to 90 days."),
  ("Can I appeal the £100 and the daily penalties together?","Yes. Penalties for the same tax year can go on one SA370 form, with a section for each penalty."),
  ("Why is my 6-month penalty more than £300?","It is 5% of the tax due if that is more than £300. If you haven't filed, HMRC uses its own estimate of the tax – filing your return replaces it."),
  ("Does filing my return now stop the penalties?","It stops further late filing penalties from being added, and replaces HMRC's estimate. It doesn't cancel penalties already charged – for that you need to appeal."),
 ],
 sources=[("Self Assessment penalties (GOV.UK)","https://www.gov.uk/self-assessment-tax-returns/penalties"),("Reasonable excuses (GOV.UK)","https://www.gov.uk/tax-appeals/reasonable-excuses"),("How to appeal late filing and late payment penalties – SA370 (GOV.UK)","https://www.gov.uk/government/publications/self-assessment-appeal-against-penalties-for-late-filing-and-late-payment-sa370")],
)

# ---------------------------------------------------------------- 3
page(
 slug="self-assessment-late-payment-penalty",
 chip="Late payment penalty",
 title="HMRC late payment penalty for Self Assessment: 5% explained",
 meta_title="HMRC Self Assessment late payment penalty (5%) – explained | Tax Letter Sorted",
 desc="HMRC charged you a 5% late payment penalty? How Self Assessment late payment penalties and interest work, what to do if you can't pay, and when you can appeal.",
 lead="If tax from your Self Assessment return is still unpaid 30 days after the payment deadline, HMRC charges a penalty of 5% of the unpaid tax – and again at 6 and 12 months.",
 facts=[("Payment deadline","31 January after the end of the tax year"),("30 days late","5% of the tax still unpaid"),("6 months late","Another 5% of the tax still unpaid"),("12 months late","Another 5% of the tax still unpaid"),("Interest","Charged on top, from the due date – interest can't be appealed")],
 body="""
<h2>What the letter means</h2>
<p>The notice (form SA370, headed late payment penalties) shows the tax that was unpaid on a given date and the 5% charged on it. Page 2 usually shows the exact figure HMRC used.</p>
<p>The penalty is separate from any late <i>filing</i> penalty. You can owe both for the same year.</p>

<h2>Interest is different</h2>
<p>HMRC also charges interest on tax paid late, from the day after it was due until it is paid. Interest is not a penalty, so it can't be appealed – but if a penalty is cancelled, the interest on that penalty goes too.</p>

<h2>If you can't pay</h2>
<p>Not having the money is not a reasonable excuse on its own. What helps:</p>
<ul class="list">
<li><b>Pay what you can now</b> – the 5% penalties and interest are worked out on what is still unpaid.</li>
<li><b>Set up a payment plan</b> (Time to Pay). You can often do this online if you owe £30,000 or less, or call HMRC on 0300 200 3820.</li>
<li><b>Had a payment plan before the penalty date?</b> Contact HMRC about the penalty, as it may not apply.</li>
</ul>

<h2>Can you appeal?</h2>
<p>Yes, if a <b>reasonable excuse</b> stopped you paying on time and you paid as soon as you could. Examples HMRC gives include a serious illness or unexpected hospital stay, a death in the family shortly before the deadline, failure of HMRC's online systems, and fire, flood or theft. A payment that bounced because there wasn't enough money usually doesn't count.</p>
<p>See the <a href="https://www.gov.uk/tax-appeals/reasonable-excuses" rel="nofollow">full list on GOV.UK</a>.</p>

<h2>How to appeal</h2>
<ol class="list">
<li>Appeal within 30 days of the date on the penalty notice (later appeals need a reason for the delay).</li>
<li>Appeal online, or post form SA370 to: Self Assessment, HM Revenue and Customs, BX9 1AS.</li>
<li>Late filing and late payment penalties for the same tax year can go on the same SA370.</li>
</ol>
<p class="small">This page covers tax years up to 2025-26. From 2026-27, people in Making Tax Digital for Income Tax come under new penalty rules.</p>
""",
 help="""<p>Upload the notice for a free explanation of the penalty, the interest and your deadlines. If your reason may be accepted, you choose how to appeal:</p><ul class="list"><li><b>Free</b> – appeal online yourself: copy and paste our wording (needs your HMRC sign&#8209;in).</li><li><b>£19</b> – we fill in the official SA370; you print, sign and post it.</li><li><b>£39</b> – a qualified accountant reviews your appeal first.</li></ul><p>If not, we show you the payment options instead.</p>""",
 faq=[
  ("How much is the HMRC late payment penalty?","5% of the tax still unpaid 30 days after the deadline, then another 5% of what is unpaid at 6 months and again at 12 months. Interest is charged on top."),
  ("Is not being able to afford it a reasonable excuse?","No, not on its own. Set up a payment plan with HMRC as early as you can instead."),
  ("Can I appeal the interest?","No. Interest can't be appealed. If the penalty itself is cancelled, the interest on the penalty is removed as well."),
 ],
 sources=[("Self Assessment penalties (GOV.UK)","https://www.gov.uk/self-assessment-tax-returns/penalties"),("Reasonable excuses (GOV.UK)","https://www.gov.uk/tax-appeals/reasonable-excuses"),("Pay your Self Assessment bill in instalments (GOV.UK)","https://www.gov.uk/pay-self-assessment-tax-bill/pay-in-instalments")],
)

# ---------------------------------------------------------------- 4
page(
 slug="corporation-tax-late-filing-penalty",
 kind="co",
 chip="Corporation Tax penalty",
 title="Corporation Tax late filing penalty: the new £200 penalties explained",
 meta_title="Corporation Tax late filing penalty – £200 from April 2026 | Tax Letter Sorted",
 desc="HMRC late filing penalty for your company tax return (CT600)? The doubled penalties from 1 April 2026, tax-related penalties, and how a director can appeal.",
 lead="If your company tax return (CT600) reaches HMRC after the filing deadline, HMRC charges the company a penalty. For returns due on or after 1 April 2026, the fixed penalties have doubled.",
 facts=[("Filing deadline","12 months after the end of the accounting period"),("1 day late","£200 (was £100)"),("3 months late","Another £200 – £400 in total (was £200)"),("Late 3 times in a row","£1,000, and £2,000 if 3 months late"),("Time to appeal","30 days from the date of the penalty notice")],
 body="""
<h2>This letter is from HMRC, not Companies House</h2>
<p>Companies send two different things each year: the company tax return to <b>HMRC</b>, and the annual accounts to <b>Companies House</b>. Each has its own deadline and its own penalty. If your letter is from Companies House, see <a href="companies-house-late-filing-penalty.html">Companies House late filing penalty</a>.</p>

<h2>The fixed penalties</h2>
<table class="tbl"><thead><tr><th>Return late by</th><th>Filing date before 1 April 2026</th><th>Filing date on or after 1 April 2026</th></tr></thead><tbody>
<tr><td>1 day</td><td>£100</td><td>£200</td></tr>
<tr><td>3 months</td><td>another £100 (£200 total)</td><td>another £200 (£400 total)</td></tr>
<tr><td>Late 3 times in a row</td><td>£500</td><td>£1,000</td></tr>
<tr><td>Late 3 times in a row, 3 months late</td><td>£1,000</td><td>£2,000</td></tr>
</tbody></table>
<p>The new amounts depend on the <b>filing date</b> of the return, not when the accounting period ended. If the amount on your letter doesn't match the right column, it is worth checking.</p>

<h2>When it gets more serious</h2>
<p>If the return is 6 months late (18 months after the end of the accounting period), HMRC may estimate the company's tax bill (a <i>tax determination</i>) and charge a tax-related penalty of <b>10% of the unpaid tax</b>. It rises to <b>20%</b> if the return is not delivered within 2 years of the end of the period.</p>
<p>A tax determination can't be appealed – the only way to replace it is to file the real return and pay the tax.</p>

<h2>Can the company appeal?</h2>
<p>Yes, if the company had a <b>reasonable excuse</b> and filed as soon as it could. Typical examples are the serious illness or death of the director who deals with the return when no one else could file it, a failure of HMRC's online services, or a fire or flood that destroyed records. HMRC usually expects other directors to step in, so the illness of one director is weaker where there are others.</p>

<h2>How to appeal</h2>
<ol class="list">
<li><b>File the return and pay the tax first</b> – HMRC may not deal with the appeal until it has both.</li>
<li>Appeal within 30 days of the date on the penalty notice.</li>
<li>Use HMRC's online appeal form, then print it and post it to: Corporation Tax Services, HM Revenue and Customs, BX9 1AX. You can also write to the address on the penalty notice.</li>
<li>A director (or the company secretary) signs it. Include the company name, Corporation Tax reference (UTR) and the accounting period.</li>
</ol>
<p>If HMRC refuses, the company can ask for a review or appeal to the tax tribunal within 30 days.</p>
""",
 help="""<p>Upload the penalty notice for a free explanation, with the deadlines and a check that the amount is right. If an appeal is possible, you choose how to appeal:</p><ul class="list"><li><b>Free</b> – appeal online yourself: copy and paste our wording (needs the company's HMRC sign&#8209;in).</li><li><b>£59</b> – a qualified accountant prepares the appeal and sends it to HMRC for you.</li></ul>""",
 company=True,
 faq=[
  ("How much is the Corporation Tax late filing penalty in 2026?","For returns with a filing date on or after 1 April 2026: £200 if the return is late, another £200 at 3 months, and £1,000 or £2,000 if it is the third late return in a row."),
  ("Is the HMRC penalty the same as the Companies House penalty?","No. They are separate penalties from separate bodies, for different documents. A company can get both for the same year."),
  ("Can we appeal before filing the return?","You can send the appeal, but HMRC may not deal with it until the return is filed and the tax paid, so file first."),
 ],
 sources=[("Increases to Corporation Tax late filing penalties (GOV.UK)","https://www.gov.uk/government/publications/corporation-tax-increases-to-late-filing-penalties/increases-to-corporation-tax-late-filing-penalties"),("Corporation Tax: penalty determinations – CT211 notes (GOV.UK)","https://www.gov.uk/government/publications/corporation-tax-penalty-determinations-ct211-notes/corporation-tax-penalty-determinations-ct211-notes")],
)

# ---------------------------------------------------------------- 5
page(
 slug="companies-house-late-filing-penalty",
 kind="co",
 chip="Companies House penalty",
 title="Companies House late filing penalty: amounts and how to appeal",
 meta_title="Companies House late filing penalty – amounts and appeals | Tax Letter Sorted",
 desc="Got a late filing penalty from Companies House for late annual accounts? The penalty amounts, why it doubles, the strict appeal test and what happens if you don't pay.",
 lead="Companies House charges a penalty when a company's annual accounts arrive after the deadline. It is not HMRC – and it is harder to appeal than an HMRC penalty.",
 facts=[("Deadline (private company)","9 months after the end of the financial year (first accounts: 21 months after incorporation)"),("Up to 1 month late","£150"),("1 to 3 months late","£375"),("3 to 6 months late","£750"),("More than 6 months late","£1,500"),("Late two years running","The penalty is doubled")],
 body="""
<h2>This letter is from Companies House</h2>
<p>Companies House is the register of companies. It is separate from HMRC, so this penalty is for your <b>annual accounts</b>, not your company tax return. If HMRC has charged a penalty for the tax return, see <a href="corporation-tax-late-filing-penalty.html">Corporation Tax late filing penalty</a>.</p>

<h2>The penalty amounts</h2>
<table class="tbl"><thead><tr><th>Accounts late by</th><th>Private company or LLP</th><th>Public company</th></tr></thead><tbody>
<tr><td>Up to 1 month</td><td>£150</td><td>£750</td></tr>
<tr><td>1 to 3 months</td><td>£375</td><td>£1,500</td></tr>
<tr><td>3 to 6 months</td><td>£750</td><td>£3,000</td></tr>
<tr><td>More than 6 months</td><td>£1,500</td><td>£7,500</td></tr>
</tbody></table>
<p>If the accounts were also late the year before, the penalty is <b>doubled</b>. If the amount on your letter doesn't match how late the accounts were, check it.</p>

<h2>Can you appeal?</h2>
<p>Only in <b>exceptional circumstances</b> – Companies House has very little discretion. An example it gives is a fire that destroyed the company's records a few days before the deadline. Other cases that may succeed are a serious illness or death of a director at a critical time when no one else could file, or a Companies House system failure on the day.</p>
<p>Companies House says these are <b>not</b> accepted on their own:</p>
<ul class="list">
<li>the company is dormant, or these were its first accounts</li>
<li>the company can't afford to pay, or is in financial difficulty</li>
<li>the accountant was ill, or the directors relied on the accountant</li>
<li>the directors didn't know the rules, or were living or travelling abroad</li>
<li>another director was responsible for the accounts</li>
<li>the accounts were delayed or lost in the post</li>
</ul>

<h2>How to appeal</h2>
<ol class="list">
<li>Appeal online through Companies House's appeal service, or by email to enquiries@companieshouse.gov.uk. Include the <b>penalty reference</b> and <b>company number</b>.</li>
<li>Explain what happened, with dates, and attach evidence.</li>
<li>If the appeal is refused, you can ask the Senior Casework Unit to look again, and after that the Independent Adjudicators.</li>
</ol>
<p>There is no fixed time limit, but appeal straight away – unpaid penalties are passed to debt collectors and can go to the County Court (or the Sheriff Court in Scotland). If you can't pay in one go, you can ask Companies House for monthly instalments.</p>
""",
 help="""<p>Upload the Companies House letter for a free explanation and a check that the amount matches how late the accounts were. If your circumstances may be accepted, you choose how to appeal:</p><ul class="list"><li><b>Free</b> – appeal online yourself: copy and paste our wording into Companies House's appeal service.</li><li><b>£59</b> – a qualified accountant prepares the appeal for you.</li></ul><p>If not, we show you how to pay or ask for instalments.</p>""",
 company=True,
 faq=[
  ("Is a Companies House penalty the same as an HMRC penalty?","No. Companies House fines the company for late accounts; HMRC fines it separately for a late company tax return. You may need to deal with both."),
  ("My company is dormant – do I still have to pay?","Yes. Being dormant is not a reason Companies House accepts. Dormant companies still have to file accounts on time."),
  ("Can I pay a Companies House penalty in instalments?","You can ask. Contact Companies House, preferably by email, and explain why you can't pay the full amount at once."),
 ],
 sources=[("Late filing penalties – Companies House (GOV.UK)","https://www.gov.uk/government/publications/late-filing-penalties-from-companies-house/late-filing-penalties"),("Prepare annual accounts: penalties for late filing (GOV.UK)","https://www.gov.uk/annual-accounts/penalties-for-late-filing")],
)

# ---------------------------------------------------------------- 6
page(
 slug="hmrc-nudge-letter-online-sellers",
 kind="nudge",
 chip="Nudge letters (online sellers)",
 title="HMRC nudge letters and letters to online sellers: what to do",
 meta_title="HMRC nudge letter – selling on eBay, Vinted, Etsy or Airbnb | Tax Letter Sorted",
 desc="Got a letter from HMRC about income from eBay, Vinted, Etsy, Airbnb or another platform? What a nudge letter means, when online sales are taxable, the £1,000 trading allowance and how to reply.",
 lead="A 'nudge' letter is HMRC asking you to check your tax, because it has information that you may have income you haven't told it about – often from selling online. It is not a fine and not an investigation, but don't ignore it.",
 facts=[("What it is","A request to check your tax position – not a penalty"),("Online platforms","Report sellers to HMRC every January, from the 2024 calendar year"),("Reported if","30 or more sales, or about £1,700 (€2,000) or more, in a year"),("Trading allowance","Up to £1,000 a year of trading income can be tax-free"),("Your reply","By the date in the letter, if it gives one")],
 body="""
<h2>Why HMRC wrote to you</h2>
<p>Since 1 January 2024, websites and apps such as eBay, Vinted, Etsy and Airbnb have had to collect details of their sellers and report them to HMRC each January. HMRC compares this with tax returns and writes to people whose income doesn't seem to have been declared.</p>
<p>Your details are reported if you make 30 or more sales, or receive about £1,700 (€2,000) or more, in a calendar year. <b>Being reported doesn't mean you owe tax.</b></p>
<p>HMRC sends similar letters about other income too, for example rental income, overseas income or crypto, and when it expected a tax return that didn't arrive.</p>

<h2>Is your online selling taxable?</h2>
<ul class="list">
<li><b>Selling your own unwanted things</b> – clothes, the contents of your loft – for less than you paid is usually not trading, and usually not taxable.</li>
<li><b>Buying or making things to sell at a profit</b> is likely to be trading, and the profit is taxable.</li>
<li>If your trading income is £1,000 or less in a tax year, the <b>trading allowance</b> usually means you don't need to tell HMRC about it.</li>
</ul>
<p>Renting out a room or a property (Airbnb, for example) follows its own rules, including a separate £1,000 property allowance and the Rent a Room scheme.</p>

<h2>What to do now</h2>
<ol class="list">
<li>Note the date HMRC asks you to reply by.</li>
<li>Work out what you sold, and whether it was your own belongings or trading. Platforms send you a copy of what they reported.</li>
<li>If you owe tax, tell HMRC and file the returns. Owning up before HMRC asks again usually means lower penalties.</li>
<li>If you don't owe anything, reply to say so – keep your records in case HMRC asks.</li>
</ol>
<p>If the letter mentions a <b>compliance check</b>, or asks for documents within a set time, it is more than a nudge – speak to an accountant.</p>
""",
 help="""<p>Upload the letter for a free explanation in plain English or Romanian: what HMRC is asking, your deadline and your options. If you need help with a tax return or a reply, you can ask a qualified accountant to call you.</p>""",
 faq=[
  ("Do I have to pay tax on things I sold on Vinted or eBay?","Usually not, if you were selling your own used belongings. Buying or making things to sell for a profit is trading, and profit above the £1,000 trading allowance is taxable."),
  ("Is a nudge letter an investigation?","No. It asks you to check your tax and correct it if needed. If you ignore it, HMRC may open a formal check later."),
  ("I was reported by a platform. Does that mean I owe tax?","No. Platforms report everyone above the threshold. Whether you owe tax depends on what you sold and whether it was trading."),
 ],
 sources=[("Selling goods or services on a digital platform (GOV.UK)","https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform"),("Check if you need to send a Self Assessment tax return (GOV.UK)","https://www.gov.uk/check-if-you-need-tax-return")],
)

# ================================================================ batch 2a (individual letters, explanation only)
# ---------------------------------------------------------------- 7
page(
 slug="hmrc-p800-tax-calculation",
 kind="explain",
 chip="P800 tax calculation",
 title="HMRC P800 tax calculation letter: refund or tax to pay?",
 meta_title="HMRC P800 letter explained – tax refund or underpayment | Tax Letter Sorted",
 desc="Got a P800 from HMRC? What the tax calculation means, how to claim a refund safely, how underpaid tax is collected through your tax code, and what to do if the figures are wrong.",
 lead="A P800 is HMRC's end-of-year check of the tax you paid through your job or pension. It tells you whether you paid too much – and get a refund – or too little, and how you'll pay it back.",
 facts=[("Who gets one","Employees and pensioners who pay tax through PAYE"),("When it arrives","Between June and March after the tax year ends (5 April)"),("Refund claimed online","Usually paid within 5 working days"),("Refund by cheque","Arrives within 14 days of the letter, if the letter says a cheque is coming"),("Tax owed (under £3,000)","Usually collected through your tax code over 12 months")],
 body="""
<h2>Why you got a P800</h2>
<p>After the tax year ends, HMRC compares the tax taken from your pay or pension with the tax you should have paid. If they don't match, it sends a P800. Common reasons are:</p>
<ul class="list">
<li>you were on the wrong tax code</li>
<li>you had two jobs (or a job and a pension) paid in the same month</li>
<li>you started getting a workplace pension</li>
<li>you got Employment and Support Allowance or Jobseeker's Allowance</li>
</ul>
<p>If you are in Self Assessment, you won't usually get a P800 – your tax is sorted out through your tax return instead.</p>

<h2>If the P800 says you're due a refund</h2>
<ul class="list">
<li><b>Letter says you can claim online:</b> claim through GOV.UK, your personal tax account or the HMRC app. You'll need the P800 reference and your National Insurance number. Money usually arrives within 5 working days.</li>
<li><b>Letter says a cheque will be sent:</b> you don't need to do anything. It should arrive within 14 days of the date on the letter.</li>
</ul>
<p><b>Watch out for scams.</b> HMRC doesn't ask for bank details by text or email. Only claim through GOV.UK or the official HMRC app – never through a link in a message.</p>

<h2>If the P800 says you owe tax</h2>
<p>If you still have a job or pension, earn enough, and owe less than £3,000, HMRC usually collects it automatically by changing your tax code. The amount is spread over 12 months, starting the next tax year. You can choose to pay it all at once instead.</p>
<p>If it can't be collected this way, HMRC writes to tell you how to pay – often with a Simple Assessment bill. <a href="hmrc-simple-assessment-pa302.html">More about Simple Assessment</a>.</p>

<h2>If you think the P800 is wrong</h2>
<p>Check the income, benefits and tax figures against your P60, P45 or payslips. If something is wrong, contact HMRC's Income Tax helpline, say which amounts are wrong and what they should be. If HMRC agrees, it sends a new calculation; if not, it explains why.</p>
<p>A wrong tax code often causes the same problem the next year too, so it's worth checking your current code at the same time.</p>
""",
 help="""<p>Upload your P800 for a free explanation in plain English or Romanian: whether it's a refund or tax to pay, the amounts, and what to do next. If the figures look wrong, you can ask a qualified accountant to call you – free.</p>""",
 faq=[
  ("Is a P800 refund genuine or a scam?","A real P800 comes by post or appears in your personal tax account. Claim only through GOV.UK or the HMRC app. HMRC doesn't send texts or emails asking for bank details."),
  ("How long does a P800 refund take?","About 5 working days if you claim online. If the letter says a cheque is being sent, it should arrive within 14 days of the letter."),
  ("Do I have to pay the underpayment straight away?","Usually not. If you owe less than £3,000 and have a job or pension, HMRC normally collects it through your tax code over the next tax year. You can pay it in full earlier if you want."),
 ],
 sources=[("Tax overpayments and underpayments (GOV.UK)","https://www.gov.uk/tax-overpayments-and-underpayments"),("If your P800 says you're due a refund (GOV.UK)","https://www.gov.uk/tax-overpayments-and-underpayments/if-youre-due-a-refund"),("If your P800 says you owe tax (GOV.UK)","https://www.gov.uk/tax-overpayments-and-underpayments/if-you-owe-tax")],
)

# ---------------------------------------------------------------- 8
page(
 slug="hmrc-simple-assessment-pa302",
 kind="explain",
 chip="Simple Assessment (PA302)",
 title="HMRC Simple Assessment letter (PA302): what it is and how to pay",
 meta_title="HMRC Simple Assessment (PA302) explained – deadlines and payment | Tax Letter Sorted",
 desc="Got a Simple Assessment tax bill from HMRC? Why you got it, when you have to pay, how to pay with the right reference, and what to do within 60 days if the figures are wrong.",
 lead="A Simple Assessment is a tax bill HMRC works out for you, without you filing a tax return. It usually comes when you owe tax that can't be collected through your tax code.",
 facts=[("What it is","A tax bill calculated by HMRC – no tax return needed"),("Pay by (letter sent before 31 October)","31 January after the end of the tax year"),("Pay by (letter sent on or after 31 October)","3 months from the date of the letter"),("Think it's wrong?","Contact HMRC within 60 days of the letter"),("Payment reference","14 characters, starting with X – on your letter")],
 body="""
<h2>Why you got a Simple Assessment</h2>
<p>HMRC uses Simple Assessment when you owe tax but don't need to file a tax return. The usual reasons are:</p>
<ul class="list">
<li>you owe tax that can't be taken automatically through your tax code</li>
<li>you owe HMRC more than £3,000</li>
</ul>
<p>The letter (PA302) shows the income HMRC used – pay, pensions, savings interest, benefits – and how the tax was worked out.</p>

<h2>When and how to pay</h2>
<ul class="list">
<li>If the letter was sent <b>before 31 October</b> following the tax year, pay by <b>31 January</b>.</li>
<li>If it was sent <b>on or after 31 October</b>, pay within <b>3 months of the date on the letter</b>.</li>
</ul>
<p>You can pay online, by bank transfer or by cheque, in one go or in smaller amounts – as long as it's all paid by the deadline. Always use the 14-character payment reference starting with X from your letter. A wrong reference can delay the payment or put it against a different bill.</p>
<p>If you can't pay in full, contact HMRC before the deadline to ask about a payment plan. Interest is charged on anything paid late.</p>

<h2>If you think the figures are wrong</h2>
<p>Check each income figure against your P60, pension statements and bank interest statements. If something is wrong, contact HMRC <b>within 60 days</b> of the date on the letter – by phone or in writing – and say which amounts are wrong and what they should be.</p>
<p>Keep in mind that you still have to pay by the deadline while HMRC looks at it, unless HMRC tells you in writing that you can wait. If HMRC disagrees with you, it sends a decision letter, and you then have 30 days to appeal.</p>

<h2>Simple Assessment and Self Assessment are different</h2>
<p>With Simple Assessment, HMRC does the calculation and you just check and pay. With Self Assessment, you file a tax return and work out the tax yourself. If you're already in Self Assessment, you won't usually get a Simple Assessment for the same year.</p>
""",
 help="""<p>Upload your Simple Assessment for a free explanation in plain English or Romanian: why you got it, how the tax was worked out, your payment deadline and your 60-day window to query it. If the figures look wrong, you can ask a qualified accountant to call you – free.</p>""",
 faq=[
  ("Do I need to file a tax return if I got a Simple Assessment?","No. HMRC has already worked out the tax. You only need to check the figures and pay by the deadline."),
  ("Can I pay a Simple Assessment in instalments?","You can pay in smaller amounts as long as everything is paid by the deadline. If you need longer, ask HMRC about a payment plan before the deadline."),
 ],
 sources=[("Simple Assessment (GOV.UK)","https://www.gov.uk/simple-assessment"),("Tax overpayments and underpayments (GOV.UK)","https://www.gov.uk/tax-overpayments-and-underpayments")],
)

# ---------------------------------------------------------------- 9
page(
 slug="self-assessment-notice-to-file",
 help_btn=True,
 kind="explain",
 chip="Notice to file a tax return",
 title="HMRC notice to file a Self Assessment tax return: what to do",
 meta_title="HMRC notice to file a tax return – deadlines and what to do | Tax Letter Sorted",
 desc="HMRC has asked you to send a Self Assessment tax return? What the notice to file means, your deadline, why you must file even if you owe nothing, and what to do if you don't think you need to.",
 lead="A notice to file means HMRC wants a Self Assessment tax return from you for the tax year shown. Once you've been sent one, you have to file – even if you think you owe no tax.",
 facts=[("Online deadline","31 January after the end of the tax year"),("Paper deadline","31 October after the end of the tax year"),("Notice sent late?","If dated after 31 October, you have 3 months from the date of the notice"),("Tax to pay by","31 January after the end of the tax year"),("If you miss the deadline","Automatic £100 penalty, then more after 3, 6 and 12 months")],
 body="""
<h2>Why you got this letter</h2>
<p>HMRC sends a notice to file when it thinks you need to complete a tax return – for example because you've registered as self-employed, have rental or foreign income, earn above certain limits, or filed a return in the past. It can come as a letter or as an email to your online account.</p>
<p>Once a notice has been sent, the return is <b>required</b>. Not owing any tax doesn't stop the £100 penalty if the return is late.</p>

<h2>Your deadlines</h2>
<table class="tbl"><thead><tr><th>What</th><th>Deadline</th></tr></thead><tbody>
<tr><td>Paper return</td><td>31 October after the end of the tax year</td></tr>
<tr><td>Online return</td><td>31 January after the end of the tax year</td></tr>
<tr><td>Online return, if you want tax owed collected through your tax code</td><td>30 December</td></tr>
<tr><td>Paying the tax you owe</td><td>31 January after the end of the tax year</td></tr>
</tbody></table>
<p>If the notice is dated <b>after 31 October</b>, your filing deadline is 3 months from the date of the notice. The payment date doesn't move.</p>

<h2>If you don't think you need to file</h2>
<p>Use HMRC's online checker to see whether you need a return. If you don't, tell HMRC <b>before the deadline</b> and ask it to withdraw the notice. If HMRC agrees, you won't get a penalty for that year.</p>
<p>Don't simply ignore the letter – if the notice stands and no return arrives, penalties start automatically. <a href="hmrc-100-late-filing-penalty.html">How the £100 late filing penalty works</a>.</p>

<h2>What you'll need to file</h2>
<ul class="list">
<li>your Unique Taxpayer Reference (UTR) and Government Gateway sign-in</li>
<li>your income for the tax year (6 April to 5 April): self-employment, rent, pay (P60), pensions, savings interest</li>
<li>details of any other income earned throughout the tax year</li>
<li>your expenses, if you're self-employed or a landlord</li>
<li>any pension contributions or Gift Aid donations</li>
</ul>
""",
 help="""<p>Upload the notice for a free explanation in plain English or Romanian, with your exact filing and payment deadlines. If you'd like the return done for you, a qualified accountant can prepare and file it – ask for a quote after your explanation.</p>""",
 faq=[
  ("Do I have to file if I don't owe any tax?","Yes, once HMRC has sent a notice to file – unless you ask HMRC to withdraw it before the deadline and it agrees. Otherwise the £100 late filing penalty still applies."),
  ("I got the notice in December. When is my deadline?","If the notice is dated after 31 October, you have 3 months from the date of the notice to file. Tax is still due by 31 January."),
  ("How do I know if I really need a tax return?","Use HMRC's online checker on GOV.UK. If it says you don't need one, contact HMRC before the deadline and ask it to cancel the notice."),
 ],
 sources=[("Self Assessment deadlines (GOV.UK)","https://www.gov.uk/self-assessment-tax-returns/deadlines"),("Check if you need to send a Self Assessment tax return (GOV.UK)","https://www.gov.uk/check-if-you-need-tax-return")],
)

# ---------------------------------------------------------------- 10
page(
 slug="self-assessment-statement-payments-on-account",
 kind="explain",
 chip="Self Assessment statement",
 title="HMRC Self Assessment statement: payments on account and what you owe",
 meta_title="HMRC Self Assessment statement (SA300) and payments on account explained | Tax Letter Sorted",
 desc="Got a Self Assessment statement from HMRC? How to read it, what payments on account are, why you owe more than you expected, and what to do if you can't pay.",
 lead="A Self Assessment statement shows what you owe HMRC and what you've paid: the balancing payment, payments on account, interest and any penalties. Many people are surprised by the payments on account.",
 facts=[("Balancing payment","Due 31 January after the end of the tax year"),("1st payment on account","Due 31 January – half of last year's bill"),("2nd payment on account","Due 31 July – the other half"),("No payments on account if","Last year's bill was under £1,000, or over 80% of your tax was paid at source"),("Can't pay?","Ask HMRC for a payment plan (Time to Pay) – 0300 200 3820")],
 body="""
<h2>Why you owe more than your tax bill</h2>
<p>Most people in Self Assessment pay tax in advance, in two <b>payments on account</b>. Each one is normally half of last year's bill, due on 31 January and 31 July. On 31 January you pay the <b>balancing payment</b> for the year just ended <i>and</i> the first payment on account for the current year – so the first bill can be up to one and a half times what you expected.</p>
<p>You don't have to make payments on account if last year's bill was under £1,000, or if more than 80% of your tax was already paid through your tax code or taken off savings interest.</p>

<h2>Reading the statement</h2>
<ul class="list">
<li><b>Balancing payment:</b> the tax for the last year minus any payments on account you made towards it.</li>
<li><b>Payments on account:</b> the advance payments for the current year.</li>
<li><b>Interest:</b> charged on anything paid late, from the due date.</li>
<li><b>Penalties:</b> late filing or late payment penalties, if any.</li>
<li><b>Amount due:</b> what you need to pay, and by when.</li>
</ul>

<h2>Can you reduce your payments on account?</h2>
<p>Yes, if you expect your income this year to be lower than last year. You can ask HMRC to reduce them in your online account, or on form SA303. Only reduce them if you're confident – if your final bill turns out higher, HMRC charges interest on the difference.</p>

<h2>If you can't pay</h2>
<ul class="list">
<li><b>Pay what you can</b> – interest and penalties are worked out on what's still unpaid.</li>
<li><b>Set up a payment plan</b> (Time to Pay). You can often do this online if you owe £30,000 or less, or call HMRC on 0300 200 3820.</li>
<li><b>Don't ignore debt letters.</b> If HMRC's Debt Management team writes to you, contact them before the date on the letter – HMRC can take enforcement action.</li>
</ul>
<p>Paid late? <a href="self-assessment-late-payment-penalty.html">How the 5% late payment penalty works</a>.</p>
""",
 help="""<p>Upload your statement for a free explanation in plain English or Romanian: what each amount is, what's due and when. For a full review of what you owe and your options – including a payment plan – you can book a 30-minute call with a qualified accountant for <b>£59</b>.</p>""",
 faq=[
  ("Why is my January tax bill so high?","On 31 January you pay the balancing payment for last year plus the first payment on account for this year. In your first year in Self Assessment, that can be up to one and a half times your tax bill."),
  ("What is a payment on account?","An advance payment towards next year's tax, normally half of last year's bill, due on 31 January and 31 July."),
  ("Can I set up a payment plan with HMRC?","Yes. Many people can set one up online if they owe £30,000 or less. Otherwise, call HMRC on 0300 200 3820. Do it as early as you can."),
 ],
 sources=[("Payments on account (GOV.UK)","https://www.gov.uk/understand-self-assessment-bill/payments-on-account"),("Self Assessment deadlines (GOV.UK)","https://www.gov.uk/self-assessment-tax-returns/deadlines"),("Pay your Self Assessment bill in instalments (GOV.UK)","https://www.gov.uk/pay-self-assessment-tax-bill/pay-in-instalments")],
)

# ================================================================ batch 2b (10 Nov 2026)
# ---------------------------------------------------------------- 11
page(
 slug="vat-late-submission-penalty-points",
 kind="co",
 extra=("File my VAT returns for me", "contact.html?kind=service&svc=vat"),
 chip="VAT penalty",
 title="VAT late submission penalty points and the £200 penalty explained",
 meta_title="VAT late submission penalty – points and £200 penalty explained | Tax Letter Sorted",
 desc="Got a VAT penalty point or a £200 late submission penalty from HMRC? How the points system works, the thresholds, how to get points removed, and how to ask HMRC for a review.",
 lead="Since 2023, each VAT Return sent late gets a penalty point. When you reach your threshold, HMRC charges a £200 penalty – and another £200 for every late return after that.",
 facts=[("Applies to","VAT periods starting on or after 1 January 2023"),("Each late return","1 penalty point – nil and repayment returns count too"),("Threshold","Annual: 2 points · Quarterly: 4 points · Monthly: 5 points"),("At the threshold","£200 penalty, and £200 for each further late return"),("Challenge it","Ask HMRC for a review – usually within 30 days of the decision")],
 body="""
<h2>How the points system works</h2>
<p>Every VAT Return that reaches HMRC after its deadline earns one penalty point – even a nil return, or one where HMRC owes you money. A point on its own costs nothing. The money starts when you reach the threshold for how often you file:</p>
<table class="tbl"><thead><tr><th>You file</th><th>Penalty threshold</th></tr></thead><tbody>
<tr><td>Annually</td><td>2 points</td></tr>
<tr><td>Quarterly</td><td>4 points</td></tr>
<tr><td>Monthly</td><td>5 points</td></tr>
</tbody></table>
<p>When you reach the threshold, HMRC charges a <b>£200 penalty</b>. While you stay at the threshold, every further late return costs another £200.</p>

<h2>Getting points removed</h2>
<p><b>Below the threshold</b>, each point expires on its own after about 2 years (the end of the month 24 months after the month the late return was due).</p>
<p><b>At the threshold</b>, all your points are wiped only when you have both:</p>
<ul class="list">
<li>sent every return on time for a set period – 12 months if you file quarterly (4 returns), 24 months if annually, 6 months if monthly</li>
<li>sent any returns still outstanding from the last 24 months</li>
</ul>
<p>So the most important thing is to <b>keep sending returns on time</b>, even while you challenge a penalty.</p>

<h2>Late payment is separate</h2>
<p>Paying VAT late is dealt with separately, with its own late payment penalties and interest. A late return and a late payment can happen for the same period.</p>

<h2>Can you challenge a point or penalty?</h2>
<p>Yes. The penalty letter offers a review. You can challenge a point or the £200 if it is wrong, or if you had a <b>reasonable excuse</b> – something unexpected or outside your control, such as a serious illness, a death in the family shortly before the deadline, or a failure of your software or HMRC's systems. If the excuse is accepted, the point is removed too.</p>

<h2>How to ask for a review</h2>
<ol class="list">
<li>Act within 30 days of the date on the penalty decision.</li>
<li>Ask for a review in the business's VAT online account, or write to: Solicitor's Office and Legal Services, HMRC, BX9 1ZT – or the address on your letter.</li>
<li>Explain what happened, with dates, and say what evidence you have.</li>
</ol>
""",
 help="""<p>Upload the penalty letter for a free explanation: how many points you have, what the £200 is for, and your deadline. If your reason may be accepted, you choose how to appeal:</p><ul class="list"><li><b>Free</b> – appeal online yourself: copy and paste our wording (needs the business's VAT account sign&#8209;in).</li><li><b>£19</b> – we write the appeal letter; you print, sign and post it.</li><li><b>£39</b> – a qualified accountant reviews your appeal and follows it up with HMRC for you.</li></ul>""",
 faq=[
  ("Do I get a VAT penalty point for a nil return?","Yes. For VAT periods starting on or after 1 January 2023, nil returns and repayment returns sent late also get a penalty point."),
  ("How many points before I get a £200 VAT penalty?","2 points if you file annually, 4 if you file quarterly and 5 if you file monthly. At the threshold, each late return costs £200."),
  ("How do I get rid of VAT penalty points?","Below the threshold they expire after about 2 years. At the threshold, you need to send every return on time for a set period – 12 months for quarterly filers – and have no returns outstanding."),
 ],
 sources=[("Penalty points and penalties if you submit your VAT Return late (GOV.UK)","https://www.gov.uk/guidance/penalty-points-and-penalties-if-you-submit-your-vat-return-late"),("Sending a VAT Return: late returns and payment (GOV.UK)","https://www.gov.uk/submit-vat-return/late-returns-and-payment")],
)

# ---------------------------------------------------------------- 12
page(
 slug="paye-late-filing-penalty-employers",
 kind="explain",
 extra=("Run my payroll for me", "contact.html?kind=service&svc=payroll"),
 chip="PAYE penalty",
 title="PAYE late filing penalty for employers: what it means",
 meta_title="PAYE late filing penalty for employers (RTI) explained | Tax Letter Sorted",
 desc="Got a PAYE late filing penalty from HMRC? Why employers are charged when payroll reports (FPS) are late, the monthly amounts, when no penalty applies, and how to appeal.",
 lead="HMRC charges employers a penalty when payroll reports – the Full Payment Submission (FPS) – reach HMRC late, or when a month with no payments isn't reported. The amount depends on how many employees you have.",
 facts=[("Report","Full Payment Submission (FPS) – on or before each payday"),("1–9 employees","£100 a month"),("10–49 employees","£200 a month"),("50–249 employees","£300 a month"),("250 or more","£400 a month"),("Notices","Sent every quarter – pay within 30 days to avoid interest")],
 body="""
<h2>Why you got the penalty</h2>
<p>Under Real Time Information (RTI), an employer must send an FPS to HMRC every time employees are paid, on or before payday. If a report is late, or a month with no pay isn't reported, HMRC can charge a penalty for each month. Employers with more than one PAYE scheme can be charged for each one.</p>
<table class="tbl"><thead><tr><th>Number of employees</th><th>Penalty per month</th></tr></thead><tbody>
<tr><td>1 to 9</td><td>£100</td></tr>
<tr><td>10 to 49</td><td>£200</td></tr>
<tr><td>50 to 249</td><td>£300</td></tr>
<tr><td>250 or more</td><td>£400</td></tr>
</tbody></table>

<h2>When there shouldn't be a penalty</h2>
<ul class="list">
<li><b>Within 3 days:</b> the FPS was late, but all the payments on it were made within 3 days of payday.</li>
<li><b>New employer:</b> your first FPS was sent within 30 days of first paying an employee.</li>
<li><b>First time this tax year:</b> HMRC doesn't charge for the first late report in a tax year (this doesn't apply to annual schemes).</li>
</ul>
<p>If one of these fits, the penalty may be wrong and can be appealed.</p>

<h2>Estimated charges</h2>
<p>If reports are missing, HMRC may also send an estimated bill for the PAYE it thinks is due. Only sending the missing reports replaces it with the real figures.</p>

<h2>How to appeal</h2>
<p>You can appeal if the penalty isn't due, the amount is wrong, or you had a <b>reasonable excuse</b>.</p>
<ol class="list">
<li>Appeal within 30 days of the penalty notice.</li>
<li>Online: sign in to HMRC's PAYE for employers service and choose <b>Appeal a penalty</b>. Take a screenshot of the confirmation – it can't be printed.</li>
<li>By post: National Insurance Contributions and Employers Office, HM Revenue and Customs, BX9 1BX.</li>
<li>Quote the unique ID of each penalty from the notice.</li>
</ol>
""",
 help="""<p>Upload the penalty notice for a free explanation in plain English or Romanian: which months were charged, whether one of the no-penalty rules may apply, and your deadline. If you'd rather not worry about payroll deadlines again, a qualified accountant can run your payroll and send the reports to HMRC on time every month.</p>""",
 faq=[
  ("How much is the PAYE late filing penalty?","£100 a month for 1 to 9 employees, £200 for 10 to 49, £300 for 50 to 249 and £400 for 250 or more."),
  ("Is there a penalty if the FPS is only a day or two late?","Usually not, if all the payments on it were made within 3 days of payday. HMRC may still contact employers who are often late within those 3 days."),
  ("Do I get a penalty the first time I'm late?","No. The first late report in a tax year isn't charged, unless you're registered as an annual scheme."),
 ],
 sources=[("What happens if you do not report payroll information on time (GOV.UK)","https://www.gov.uk/guidance/what-happens-if-you-dont-report-payroll-information-on-time")],
)

# ---------------------------------------------------------------- 13
page(
 slug="cis-late-return-penalty",
 kind="co",
 extra=("Deal with my CIS returns", "contact.html?kind=service&svc=cis"),
 chip="CIS penalty",
 title="CIS late return penalty for contractors: amounts and appeals",
 meta_title="CIS late return penalty (£100, £200, £300) explained | Tax Letter Sorted",
 desc="Got a CIS penalty for a late monthly return? The deadline, how the penalties grow from £100, why nil returns matter, and how a contractor can appeal within 30 days.",
 lead="If you're a contractor in the Construction Industry Scheme, your monthly CIS return must reach HMRC by the 19th of the following month. If it's late, HMRC charges a penalty that grows the longer it stays late.",
 facts=[("Deadline","19th of the month after the tax month ends"),("1 day late","£100"),("2 months late","Another £200"),("6 months late","£300 or 5% of the CIS deductions, whichever is higher"),("12 months late","Another £300 or 5%, whichever is higher"),("Time to appeal","30 days from the penalty notice")],
 body="""
<h2>Why you got the penalty</h2>
<p>A contractor has to send a CIS return for every tax month (6th to 5th), by the 19th of the next month. For example, the return for 6 May to 5 June is due by 19 June. The penalty is for the return arriving late – it applies even if the deductions were paid on time.</p>

<h2>How the penalties grow</h2>
<table class="tbl"><thead><tr><th>Return late by</th><th>Penalty</th></tr></thead><tbody>
<tr><td>1 day</td><td>£100</td></tr>
<tr><td>2 months</td><td>£200</td></tr>
<tr><td>6 months</td><td>£300 or 5% of the CIS deductions on the return, whichever is higher</td></tr>
<tr><td>12 months</td><td>£300 or 5% of the CIS deductions, whichever is higher</td></tr>
</tbody></table>
<p>Returns later than that can get an extra penalty of up to £3,000 or 100% of the deductions. Each month is a separate return, so several late months mean several penalties.</p>

<h2>No subcontractors paid that month?</h2>
<p>You still need to tell HMRC. Either send a <b>nil return</b>, or tell HMRC you've stopped using subcontractors for now (an inactivity request). A missing nil return gets the same penalties as any other.</p>

<h2>Can you appeal?</h2>
<p>Yes, if the penalty is wrong or you had a <b>reasonable excuse</b> – something unexpected or outside your control, such as a serious illness, a death in the family shortly before the deadline, or a failure of HMRC's online service – and you sent the return as soon as you could.</p>

<h2>How to appeal</h2>
<ol class="list">
<li>Appeal within 30 days of the date on the penalty notice.</li>
<li>Use HMRC's online service, or write to the address on the notice (CIS general enquiries). You can't appeal by phone.</li>
<li>Quote your UTR and the payment reference from the notice, and explain what happened, with dates.</li>
</ol>
""",
 help="""<p>Upload the penalty notice for a free explanation: which months were charged, whether the amounts are right, and your deadline. If your reason may be accepted, you choose how to appeal:</p><ul class="list"><li><b>Free</b> – appeal online yourself: copy and paste our wording (needs your HMRC sign&#8209;in).</li><li><b>£19</b> – we write the appeal letter; you print, sign and post it.</li><li><b>£39</b> – a qualified accountant reviews your appeal and follows it up with HMRC for you.</li></ul>""",
 faq=[
  ("When is the CIS return due?","By the 19th of the month after the tax month ends. The tax month runs from the 6th to the 5th."),
  ("Do I need to send a CIS return if I paid no subcontractors?","Yes – send a nil return, or tell HMRC you're temporarily inactive. Otherwise you can be charged the late return penalties."),
  ("Can I appeal a CIS penalty by phone?","No. Use HMRC's online service or write to HMRC, quoting your UTR and the payment reference from the notice."),
 ],
 sources=[("What you must do as a CIS contractor: file your monthly returns (GOV.UK)","https://www.gov.uk/what-you-must-do-as-a-cis-contractor/file-your-monthly-returns"),("Penalties for failure to file CIS returns on time – CC/FS18b (GOV.UK)","https://www.gov.uk/government/publications/compliance-checks-penalties-if-you-dont-file-construction-industry-scheme-returns-on-time-ccfs18b/penalties-for-failure-to-file-returns-on-time-the-construction-industry-scheme-cis-ccfs18b")],
)

# ---------------------------------------------------------------- 14
page(
 slug="making-tax-digital-income-tax-letter",
 kind="explain",
 extra=("Help me with Making Tax Digital", "contact.html?kind=service&svc=mtd"),
 chip="Making Tax Digital",
 title="HMRC Making Tax Digital for Income Tax letter: what you need to do",
 meta_title="HMRC Making Tax Digital for Income Tax letter – what to do | Tax Letter Sorted",
 desc="Got a letter from HMRC about Making Tax Digital for Income Tax? Who has to join and when, the quarterly update deadlines, the 2026-27 penalty soft landing, and what to do now.",
 lead="Making Tax Digital (MTD) for Income Tax means sole traders and landlords keep digital records and send HMRC an update every quarter, then a tax return after the year ends. HMRC writes to people who have to start.",
 facts=[("Over £50,000 in 2024-25","Start from 6 April 2026"),("Over £30,000 in 2025-26","Start from 6 April 2027"),("Over £20,000 in 2026-27","Start from 6 April 2028"),("Income that counts","Self-employment and property income (before expenses)"),("Quarterly updates due","7 August, 7 November, 7 February and 7 May")],
 body="""
<h2>Why HMRC wrote to you</h2>
<p>HMRC looks at your Self Assessment return to see whether your <b>qualifying income</b> – your self-employment turnover plus your property income, before expenses – is over the limit. If it is, you have to use MTD from the date shown. Partnerships aren't included yet.</p>
<table class="tbl"><thead><tr><th>Qualifying income</th><th>In tax year</th><th>Start MTD from</th></tr></thead><tbody>
<tr><td>Over £50,000</td><td>2024-25</td><td>6 April 2026</td></tr>
<tr><td>Over £30,000</td><td>2025-26</td><td>6 April 2027</td></tr>
<tr><td>Over £20,000</td><td>2026-27</td><td>6 April 2028</td></tr>
</tbody></table>
<p>If you should have started on 6 April 2026 and haven't signed up yet, you can still sign up now.</p>

<h2>What changes</h2>
<ul class="list">
<li>Keep your business and property records in <b>MTD-compatible software</b>.</li>
<li>Send a <b>quarterly update</b> for each business and property: by 7 August, 7 November, 7 February and 7 May.</li>
<li>Send your <b>tax return</b> through the software after the year ends, by 31 January.</li>
<li>You still <b>pay</b> tax on the usual Self Assessment dates: 31 January and 31 July.</li>
</ul>

<h2>Penalties</h2>
<p>Late quarterly updates come under a points system. For the 2026-27 tax year HMRC won't give penalty points for late quarterly updates – but the updates and digital records are still required, and a late tax return still gets points. Don't rely on the soft landing as a reason to wait.</p>

<h2>Exemptions</h2>
<p>Some people are exempt, for example if they are digitally excluded because of age, disability, location or other reasons. Some exemptions are automatic; others you have to apply for. Exempt people still file a Self Assessment return.</p>

<h2>What to do now</h2>
<ol class="list">
<li>Check the start date in your letter.</li>
<li>Choose MTD-compatible software, or ask an accountant to do it for you.</li>
<li>Sign up before your first quarter ends, and keep digital records from the start date.</li>
</ol>
""",
 help="""<p>Upload the letter for a free explanation in plain English or Romanian: when you need to start, what you'll have to send and by when. If you'd like help, a qualified accountant can set you up and send your quarterly updates for you – you get an estimate first.</p>""",
 faq=[
  ("Do I have to use Making Tax Digital?","Only if your qualifying income – self-employment plus property income, before expenses – is over the limit: £50,000 in 2024-25, £30,000 in 2025-26 or £20,000 in 2026-27. HMRC writes to people who have to start."),
  ("When are MTD quarterly updates due?","By 7 August, 7 November, 7 February and 7 May for the standard quarters of the tax year."),
  ("Will I get a penalty for a late quarterly update in 2026-27?","HMRC has said it won't give penalty points for late quarterly updates in 2026-27. The updates are still required, and a late tax return still gets penalty points."),
 ],
 sources=[("Find out if and when you need to use Making Tax Digital for Income Tax (GOV.UK)","https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax"),("Send quarterly updates (GOV.UK)","https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax/send-quarterly-updates"),("Exemptions from Making Tax Digital for Income Tax (GOV.UK)","https://www.gov.uk/guidance/find-out-if-you-can-get-an-exemption-from-making-tax-digital-for-income-tax")],
)

# ---------------------------------------------------------------- 15
page(
 slug="companies-house-strike-off-notice",
 kind="explain",
 extra=("Stop the strike-off – get a quote", "contact.html?kind=package&strike=1"),
 chip="Strike-off notice",
 title="Companies House strike-off notice: how to stop your company being closed",
 meta_title="Companies House compulsory strike-off notice – how to stop it | Tax Letter Sorted",
 desc="Got a letter from Companies House saying your company will be struck off? Why it happens, the Gazette notice and 2-month timeline, how to stop it, and what happens if the company is dissolved.",
 lead="If Companies House thinks a company has stopped trading – usually because the accounts or confirmation statement are overdue – it starts to remove it from the register. Act quickly: once a company is dissolved, its bank account is frozen.",
 facts=[("From","Companies House (not HMRC)"),("Usual reason","Overdue confirmation statement or annual accounts"),("What comes next","A notice in The Gazette"),("Struck off","About 2 months after the Gazette notice, if nothing is done"),("To stop it","File the overdue documents, or object, as soon as possible")],
 body="""
<h2>Why you got this letter</h2>
<p>Companies House starts compulsory strike-off when it has reason to believe a company is no longer trading – most often because documents are overdue and its letters have had no reply. Usually two letters are sent, then a notice is published in <b>The Gazette</b> saying the company will be struck off.</p>

<h2>What happens if you do nothing</h2>
<ul class="list">
<li>About <b>2 months</b> after the Gazette notice, the company is struck off and <b>dissolved</b>.</li>
<li>The company's <b>bank accounts are frozen</b>.</li>
<li>Its money and property pass to the Crown.</li>
<li>Getting it back means applying to restore the company, which costs time and money.</li>
</ul>

<h2>How to stop it</h2>
<ol class="list">
<li><b>File the overdue documents</b> – usually the confirmation statement and any overdue accounts. Once they're filed, Companies House normally stops the strike-off.</li>
<li>If you need more time, <b>contact Companies House straight away</b>. Anyone with an interest in the company can object; send the objection as early as possible, and at least 2 weeks before the Gazette notice runs out.</li>
<li>After an objection, Companies House sets a deadline. If there's no progress by then, the strike-off starts again.</li>
</ol>
<p>To file, you'll need the company number and the <b>authentication code</b> (a 6-character code sent to the registered office). Directors may also need to verify their identity with Companies House.</p>

<h2>Late filing penalties too</h2>
<p>Overdue accounts also mean a Companies House late filing penalty, and a late company tax return means a separate HMRC penalty. <a href="companies-house-late-filing-penalty.html">More about Companies House penalties</a>.</p>
""",
 help="""<p>Upload the letter for a free explanation in plain English or Romanian: what is overdue and how long you have. If you'd like it sorted, a qualified accountant can file the confirmation statement and any overdue accounts for the company – you get a quote first. The confirmation statement starts from £99, Companies House fee included.</p>""",
 faq=[
  ("How long before my company is struck off?","Usually about 2 months after the notice is published in The Gazette, if the overdue documents aren't filed and no one objects."),
  ("How do I stop a compulsory strike-off?","File the overdue documents as soon as possible – usually the confirmation statement and accounts. If you need more time, contact Companies House and object before the Gazette notice runs out."),
  ("What happens to the bank account if the company is dissolved?","It is frozen, and the company's money and property pass to the Crown. To get them back, the company has to be restored to the register."),
 ],
 sources=[("Companies House: compulsory strike-off process (GOV.UK)","https://www.gov.uk/government/news/companies-house-to-resume-the-compulsory-strike-off-process"),("Strike off, dissolution and restoration (GOV.UK)","https://www.gov.uk/government/publications/strike-off-dissolution-and-restoration/strike-off-dissolution-and-restoration"),("File your confirmation statement (GOV.UK)","https://www.gov.uk/file-your-confirmation-statement-with-companies-house")],
)

DIFF = {
 "sa": "This page explains the general rules. Upload yours and we'll read your actual letter, check whether the penalty is right, tell you your exact deadline and – if your reason is one HMRC accepts – fill in the SA370 for you in English, even if you answer in Romanian.",
 "co": "This page explains the general rules. Upload yours and we'll read your actual letter, check the amount against how late the filing was, tell you your exact deadline and – if your reason may be accepted – prepare the appeal wording in English, even if you answer in Romanian.",
 "nudge": "This page explains the general rules. Upload yours and we'll read your actual letter, tell you what HMRC is asking for and by when, and explain your options in plain English or Romanian.",
 "explain": "This page explains the general rules. Upload yours and we'll read your actual letter, check the figures and dates on it, tell you exactly what to do and by when – in plain English or Romanian.",
}

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from letters_ro import PAGES_RO, DIFF_RO, UI_RO, CHECKED_RO
assert len(PAGES_RO) == len(PAGES)

UI_EN = {
 "lang": "en", "html_lang": "en", "og_locale": "en_GB", "in_language": "en-GB",
 "dir": "letters", "up": "../", "q": "",
 "upload_short": "Upload a letter",
 "cta": "Upload my letter – free explanation",
 "note": "Free explanation in English or Romanian · No account needed",
 "key_facts": "Key facts",
 "different": "Every letter is different.",
 "mid_title": "Check my dates and deadlines",
 "mid_text": "Not sure which penalty you have, whether the amount is right, or exactly when your deadline is? Upload your letter and we'll check it for you – free.",
 "mid_text_nudge": "Not sure what HMRC is asking for, or exactly when you need to reply?",
 "mid_text_explain": "Not sure whether the figures on your letter are right, or exactly when you need to act?",
 "mid_btn": "Check my letter – free",
 "help_btn": "Help me file my Self Assessment",
 "helps": "How Tax Letter Sorted helps",
 "questions": "Questions",
 "checked": "Checked against GOV.UK on {d}:",
 "disclaimer": "<strong>We are not HMRC or Companies House.</strong> This page is general guidance, not personal tax advice. Complex cases are referred to a qualified accountant.",
 "translation": None,
 "other": "Other letters we explain",
 "all": "All letters",
 "home": "Home",
 "hub_name": "Letters we explain",
 "privacy": "Privacy Policy", "terms": "Terms", "contact": "Contact",
 "footer": "Tax Letter Sorted is a trading name of Accounted4Tax Ltd, registered in England and Wales, company number 16438537. Registered office: 128 City Road, London, EC1V 2NX.",
 "by": "by Accounted4Tax",
 "other_lang": "Română",
 "hub_title": "HMRC and Companies House letters explained – penalties and appeals | Tax Letter Sorted",
 "hub_desc": "Plain-English guides to the most common HMRC and Companies House letters: late filing and late payment penalties, Corporation Tax penalties, nudge letters and more – and how to appeal.",
 "hub_h1": "HMRC and Companies House letters explained",
 "hub_lead": "Plain-English guides to the letters people ask us about most: what they mean, the deadlines, and when you can appeal. Or upload your own letter for a free explanation in English or Romanian.",
 "guides": "Guides",
 "also": "We also explain",
 "also_list": [],
 "unsure": "Not sure what your letter is? Upload it – we'll tell you.",
}

E = html.escape

def url_of(ui, slug=None):
    return f"{BASE}/{ui['dir']}/" + (f"{slug}.html" if slug else "")

def head(ui, title, desc, url, ld, alts, other_href):
    alt_tags = "\n".join(f'<link rel="alternate" hreflang="{h}" href="{u}">' for h, u in alts)
    return f"""<!doctype html>
<html lang="{ui['html_lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{url}">
{alt_tags}
<meta property="og:type" content="article">
<meta property="og:site_name" content="Tax Letter Sorted">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/images/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="{ui['og_locale']}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{ui['up']}images/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="{ui['up']}css/app.css?v={CSS_V}">
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
<header class="topbar">
  <div class="wrap">
    <a class="brand" href="{ui['up']}{ui['q']}"><b>Tax Letter Sorted</b><span>{ui['by']}</span></a>
    <div class="topnav">
      <a class="langlink" href="{other_href}" hreflang="{'ro' if ui['lang']=='en' else 'en'}">{ui['other_lang']}</a>
      <a class="topcta" href="{ui['up']}upload.html{ui['q']}">{ui['upload_short']}</a>
    </div>
  </div>
</header>
"""

def foot(ui):
    return f"""<footer>
  <div class="wrap">
    <p>{ui['footer']}</p>
    <nav aria-label="Footer">
      <a href="{ui['up']}{ui['q']}">{ui['home']}</a>
      <a href="./">{ui['hub_name']}</a>
      <a href="{ui['up']}privacy.html">{ui['privacy']}</a>
      <a href="{ui['up']}terms.html">{ui['terms']}</a>
      <a href="mailto:letters@accounted4tax.co.uk">{ui['contact']}</a>
    </nav>
  </div>
</footer>
</body>
</html>
"""

def cta(ui):
    return f"""<a class="btn" href="{ui['up']}upload.html{ui['q']}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M4 20h16"/></svg>
      <span>{E(ui['cta'])}</span>
    </a>"""

def extra_btn(ui, p):
    # optional second green button: p["extra"] = (label, link) or help_btn=True for "Help me file my Self Assessment"
    if p.get("extra"):
        label, link = p["extra"]
    elif p.get("help_btn"):
        label, link = ui["help_btn"], "contact.html?kind=help"
    else:
        return ""
    href = f"{ui['up']}{link}" + (f"&lang={ui['lang']}" if ui["q"] else "")
    return f'\n    <a class="btn" href="{href}">{E(label)}</a>'

def mid(ui, kind, extra=""):
    text = ui["mid_text"] if kind not in ("nudge", "explain") else ui["mid_text_" + kind] + " " + ui["mid_text"].split("? ", 1)[1]
    return f"""<section class="midcta">
    <h2>{E(ui['mid_title'])}</h2>
    <p>{E(text)}</p>
    <a class="btn secondary" href="{ui['up']}upload.html{ui['q']}">{E(ui['mid_btn'])}</a>{extra}
  </section>"""

def with_mid(ui, body, kind, extra=""):
    parts = re.split(r'(?=<h2>)', body.strip())
    if len(parts) > 3:
        parts.insert(3, mid(ui, kind, extra) + "\n")
    return "".join(parts)

def also_block(ui):
    chips = ""
    if ui["also_list"]:
        chips = f"""<h2>{E(ui['also'])}</h2>
    <div class="chips">
{chr(10).join(f'<span>{E(o)}</span>' for o in ui['also_list'])}
    </div>
    """
    return f"""<section class="stack">
    {chips}<p class="note" style="text-align:left">{E(ui['unsure'])}</p>
  </section>"""

def crumbs_ld(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

def note_translation(ui):
    return f'\n  <p class="callout">{E(ui["translation"])}</p>\n' if ui["translation"] else ""

def build(ui, pages, other_ui, other_pages, diff, checked):
    out = os.path.join(ROOT, ui["dir"])
    os.makedirs(out, exist_ok=True)
    home = f"{BASE}/"
    for idx, p in enumerate(pages):
        url = url_of(ui, p["slug"])
        o_url = url_of(other_ui, other_pages[idx]["slug"])
        en_url, ro_url = (url, o_url) if ui["lang"] == "en" else (o_url, url)
        alts = [("en-GB", en_url), ("ro", ro_url), ("x-default", en_url)]
        faq_ld = {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]}
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "Article", "headline": p["title"], "description": p["desc"], "url": url,
             "inLanguage": ui["in_language"], "dateModified": "2026-11-10", "image": f"{BASE}/images/og.png",
             "author": {"@type": "Organization", "name": "Accounted4Tax Ltd", "url": "https://www.accounted4tax.co.uk"},
             "publisher": {"@id": f"{BASE}/#service"}},
            faq_ld,
            crumbs_ld([(ui["home"], home), (ui["hub_name"], url_of(ui)), (p["chip"], url)])]}
        facts = "\n".join(f"<dt>{E(k)}</dt><dd>{E(v)}</dd>" for k, v in p["facts"])
        faqs = "\n".join(f'<details class="faq"><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in p["faq"])
        srcs = " · ".join(f'<a href="{u}" rel="nofollow">{E(t)}</a>' for t, u in p["sources"])
        others = "\n".join(f'<a href="{o["slug"]}.html">{E(o["chip"])}</a>' for o in pages if o is not p)
        other_href = f"{other_ui['up']}{other_ui['dir']}/{other_pages[idx]['slug']}.html".replace(other_ui['up'], ui['up'])
        kind = p.get("kind", "sa")
        doc = head(ui, p["meta_title"], p["desc"], url, ld, alts, other_href) + f"""
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="{ui['up']}{ui['q']}">{ui['home']}</a> › <a href="./">{ui['hub_name']}</a> › <span>{E(p['chip'])}</span></nav>
{note_translation(ui)}
  <section class="stack">
    <h1>{E(p['title'])}</h1>
    <p class="lead">{E(p['lead'])}</p>
    {cta(ui)}
    <p class="note">{E(ui['note'])}</p>
  </section>

  <section class="stack">
    <h2>{E(ui['key_facts'])}</h2>
    <dl class="facts keyfacts">
{facts}
    </dl>
    <div class="different"><b>{E(ui['different'])}</b> {E(diff[kind])}</div>
  </section>

  <section class="prose">
{with_mid(ui, p['body'], kind, extra_btn(ui, p))}
  </section>

  <section class="offer featured">
    <h2>{E(ui['helps'])}</h2>
    {p['help'].strip()}
    {cta(ui)}{extra_btn(ui, p)}
  </section>

  <section class="stack">
    <h2>{E(ui['questions'])}</h2>
{faqs}
  </section>

  <p class="small">{E(ui['checked'].format(d=checked))} {srcs}</p>

  <p class="callout">{ui['disclaimer']}</p>

  <section class="stack">
    <h2>{E(ui['other'])}</h2>
    <div class="chips">
{others}
<a href="./">{E(ui['all'])}</a>
    </div>
  </section>
</main>

""" + foot(ui)
        with open(os.path.join(out, p["slug"] + ".html"), "w") as f:
            f.write(doc)

    # hub
    hub_url = url_of(ui)
    en_hub, ro_hub = (hub_url, url_of(other_ui)) if ui["lang"] == "en" else (url_of(other_ui), hub_url)
    alts = [("en-GB", en_hub), ("ro", ro_hub), ("x-default", en_hub)]
    cards = "\n".join(f"""    <a class="lcard" href="{p['slug']}.html"><b>{E(p['chip'])}</b><span>{E(p['lead'])}</span></a>""" for p in pages)
    hub_ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "name": ui["hub_h1"], "url": hub_url, "inLanguage": ui["in_language"],
         "hasPart": [{"@type": "Article", "headline": p["title"], "url": url_of(ui, p["slug"])} for p in pages]},
        crumbs_ld([(ui["home"], home), (ui["hub_name"], hub_url)])]}
    other_hub_href = f"{ui['up']}{other_ui['dir']}/"
    hub = head(ui, ui["hub_title"], ui["hub_desc"], hub_url, hub_ld, alts, other_hub_href) + f"""
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="{ui['up']}{ui['q']}">{ui['home']}</a> › <span>{ui['hub_name']}</span></nav>
{note_translation(ui)}
  <section class="stack">
    <h1>{E(ui['hub_h1'])}</h1>
    <p class="lead">{E(ui['hub_lead'])}</p>
    {cta(ui)}
  </section>
  <section class="stack">
    <h2>{E(ui['guides'])}</h2>
    <div class="lcards">
{cards}
    </div>
  </section>
  {also_block(ui)}
  <p class="callout">{ui['disclaimer']}</p>
</main>

""" + foot(ui)
    with open(os.path.join(out, "index.html"), "w") as f:
        f.write(hub)

build(UI_EN, PAGES, UI_RO, PAGES_RO, DIFF, CHECKED)
build(UI_RO, PAGES_RO, UI_EN, PAGES, DIFF_RO, CHECKED_RO)
print("built", len(PAGES), "EN +", len(PAGES_RO), "RO pages + 2 hubs")
