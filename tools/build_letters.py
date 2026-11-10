#!/usr/bin/env python3
"""Builds the SEO letter pages (/letters/*.html) for Tax Letter Sorted.
Usage: python3 build_letters.py <repo_root>"""
import json, sys, html, os, re

ROOT = sys.argv[1]
BASE = "https://taxletters.accounted4tax.co.uk"
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
 help="""<p>Upload your penalty notice and we explain it in plain English or Romanian, with your exact deadlines – free. If your reason is one HMRC may accept, we fill in the SA370 for you in English: <b>£19</b> to sign and post yourself, or <b>£39</b> with a review by a qualified accountant.</p>""",
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
 help="""<p>Upload your penalty letters – free explanation of each one, the deadlines and the totals. If an appeal is possible, we put every late filing penalty for that tax year on one SA370 in English: <b>£19</b> to sign and post yourself, or <b>£39</b> with a review by a qualified accountant. Same price whatever the amount.</p>""",
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
 help="""<p>Upload the notice for a free explanation of the penalty, the interest and your deadlines. If your reason may be accepted, we fill in the SA370 in English: <b>£19</b> to sign and post yourself, or <b>£39</b> with a review by a qualified accountant. If not, we show you the payment options instead.</p>""",
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
 help="""<p>Upload the penalty notice for a free explanation, with the deadlines and a check that the amount is right. If an appeal is possible, you get the appeal wording to copy for free, or for <b>£59</b> a qualified accountant prepares the appeal and sends it to HMRC as the company's agent.</p>""",
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
 help="""<p>Upload the Companies House letter for a free explanation and a check that the amount matches how late the accounts were. If your circumstances may be accepted, you get the appeal wording to copy for free, or for <b>£59</b> a qualified accountant prepares the appeal for the director. If not, we show you how to pay or ask for instalments.</p>""",
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

DIFF = {
 "sa": "This page explains the general rules. Upload yours and we'll read your actual letter, check whether the penalty is right, tell you your exact deadline and – if your reason is one HMRC accepts – fill in the SA370 for you in English, even if you answer in Romanian.",
 "co": "This page explains the general rules. Upload yours and we'll read your actual letter, check the amount against how late the filing was, tell you your exact deadline and – if your reason may be accepted – prepare the appeal wording in English, even if you answer in Romanian.",
 "nudge": "This page explains the general rules. Upload yours and we'll read your actual letter, tell you what HMRC is asking for and by when, and explain your options in plain English or Romanian.",
}
MID = """<section class="midcta">
    <h2>Check my dates and deadlines</h2>
    <p>Not sure which penalty you have, whether the amount is right, or exactly when your deadline is? Upload your letter and we'll check it for you – free.</p>
    <a class="btn secondary" href="../upload.html">Check my letter – free</a>
  </section>"""

def with_mid(body, kind="sa"):
    parts = re.split(r'(?=<h2>)', body.strip())
    # parts[0] is '' ; insert the box before the 3rd heading
    if len(parts) > 3:
        m = MID if kind != "nudge" else MID.replace("Not sure which penalty you have, whether the amount is right, or exactly when your deadline is?", "Not sure what HMRC is asking for, or exactly when you need to reply?")
        parts.insert(3, m + "\n")
    return "".join(parts)

# ------------------------------------------------------------------ templates
E = html.escape

def head(title, desc, url, ld):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Tax Letter Sorted">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/images/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../images/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="../css/app.css">
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
<header class="topbar">
  <div class="wrap">
    <a class="brand" href="../"><b>Tax Letter Sorted</b><span>by Accounted4Tax</span></a>
    <a class="topcta" href="../upload.html">Upload a letter</a>
  </div>
</header>
"""

FOOT = """<footer>
  <div class="wrap">
    <p>Tax Letter Sorted is a trading name of Accounted4Tax Ltd, registered in England and Wales, company number 16438537. Registered office: 128 City Road, London, EC1V 2NX.</p>
    <nav aria-label="Footer">
      <a href="../">Home</a>
      <a href="./">Letters we explain</a>
      <a href="../privacy.html">Privacy Policy</a>
      <a href="../terms.html">Terms</a>
      <a href="mailto:letters@accounted4tax.co.uk">Contact</a>
    </nav>
  </div>
</footer>
</body>
</html>
"""

CTA = """<a class="btn" href="../upload.html">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M4 20h16"/></svg>
      <span>Upload my letter – free explanation</span>
    </a>"""

DISCLAIMER = """<p class="callout"><strong>We are not HMRC or Companies House.</strong> This page is general guidance, not personal tax advice. Complex cases are referred to a qualified accountant.</p>"""

def crumbs_ld(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

out = os.path.join(ROOT, "letters")
os.makedirs(out, exist_ok=True)

for p in PAGES:
    url = f"{BASE}/letters/{p['slug']}.html"
    faq_ld = {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]}
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": p["title"], "description": p["desc"], "url": url,
         "inLanguage": "en-GB", "dateModified": "2026-11-10",
         "image": f"{BASE}/images/og.png",
         "author": {"@type": "Organization", "name": "Accounted4Tax Ltd", "url": "https://www.accounted4tax.co.uk"},
         "publisher": {"@id": f"{BASE}/#service"}},
        faq_ld,
        crumbs_ld([("Home", f"{BASE}/"), ("Letters we explain", f"{BASE}/letters/"), (p["chip"], url)])]}
    facts = "\n".join(f"<dt>{E(k)}</dt><dd>{E(v)}</dd>" for k, v in p["facts"])
    faqs = "\n".join(f'<details class="faq"><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in p["faq"])
    srcs = " · ".join(f'<a href="{u}" rel="nofollow">{E(t)}</a>' for t, u in p["sources"])
    others = "\n".join(f'<a href="{o["slug"]}.html">{E(o["chip"])}</a>' for o in PAGES if o is not p)
    doc = head(p["meta_title"], p["desc"], url, ld) + f"""
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a> › <a href="./">Letters we explain</a> › <span>{E(p['chip'])}</span></nav>

  <section class="stack">
    <h1>{E(p['title'])}</h1>
    <p class="lead">{E(p['lead'])}</p>
    {CTA}
    <p class="note">Free explanation in English or Romanian · No account needed</p>
  </section>

  <section class="stack">
    <h2>Key facts</h2>
    <dl class="facts keyfacts">
{facts}
    </dl>
    <div class="different"><b>Every letter is different.</b> {E(DIFF[p.get('kind','sa')])}</div>
  </section>

  <section class="prose">
{with_mid(p['body'], p.get('kind','sa'))}
  </section>

  <section class="offer featured">
    <h2>How Tax Letter Sorted helps</h2>
    {p['help'].strip()}
    {CTA}
  </section>

  <section class="stack">
    <h2>Questions</h2>
{faqs}
  </section>

  <p class="small">Checked against GOV.UK on {CHECKED}: {srcs}</p>

  {DISCLAIMER}

  <section class="stack">
    <h2>Other letters we explain</h2>
    <div class="chips">
{others}
<a href="./">All letters</a>
    </div>
  </section>
</main>

""" + FOOT
    with open(os.path.join(out, p["slug"] + ".html"), "w") as f:
        f.write(doc)

# ---------------------------------------------------------------- hub page
hub_url = f"{BASE}/letters/"
cards = "\n".join(f"""    <a class="lcard" href="{p['slug']}.html"><b>{E(p['chip'])}</b><span>{E(p['lead'])}</span></a>""" for p in PAGES)
other = ["Notice to file a tax return", "P800 tax calculation", "Simple Assessment (PA302)", "Self Assessment statement",
         "VAT penalty", "PAYE penalty", "CIS penalty", "Making Tax Digital letters", "Companies House strike-off notice"]
hub_ld = {"@context": "https://schema.org", "@graph": [
    {"@type": "CollectionPage", "name": "HMRC and Companies House letters explained", "url": hub_url, "inLanguage": "en-GB",
     "hasPart": [{"@type": "Article", "headline": p["title"], "url": f"{BASE}/letters/{p['slug']}.html"} for p in PAGES]},
    crumbs_ld([("Home", f"{BASE}/"), ("Letters we explain", hub_url)])]}
hub = head("HMRC and Companies House letters explained – penalties and appeals | Tax Letter Sorted",
           "Plain-English guides to the most common HMRC and Companies House letters: late filing and late payment penalties, Corporation Tax penalties, nudge letters and more – and how to appeal.",
           hub_url, hub_ld) + f"""
<main class="wrap article">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a> › <span>Letters we explain</span></nav>
  <section class="stack">
    <h1>HMRC and Companies House letters explained</h1>
    <p class="lead">Plain-English guides to the letters people ask us about most: what they mean, the deadlines, and when you can appeal. Or upload your own letter for a free explanation in English or Romanian.</p>
    {CTA}
  </section>
  <section class="stack">
    <h2>Guides</h2>
    <div class="lcards">
{cards}
    </div>
  </section>
  <section class="stack">
    <h2>We also explain</h2>
    <div class="chips">
{chr(10).join(f'<span>{E(o)}</span>' for o in other)}
    </div>
    <p class="note" style="text-align:left">Not sure what your letter is? Upload it – we'll tell you.</p>
  </section>
  {DISCLAIMER}
</main>

""" + FOOT
with open(os.path.join(out, "index.html"), "w") as f:
    f.write(hub)

print("built", len(PAGES), "pages + hub")
for p in PAGES:
    print(p["slug"], len(p["body"].split()) + len(" ".join(a for _, a in p["faq"]).split()), "words")
