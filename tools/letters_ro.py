"""Romanian versions of the letter guide pages (/ro/scrisori/).
Same order as PAGES in build_letters.py – page N here is the translation of English page N.
English is authoritative. Reviewed by: (awaiting Eduard's review)"""

CHECKED_RO = "10 noiembrie 2026"

PAGES_RO = []

def page(**kw):
    PAGES_RO.append(kw)

FREE_SA = """<ul class="list"><li><b>Gratuit</b> – contestați singur online: copiați și lipiți textul nostru (aveți nevoie de datele de autentificare HMRC).</li><li><b>£19</b> – completăm formularul oficial SA370; dvs. îl tipăriți, semnați și trimiteți prin poștă.</li><li><b>£39</b> – un contabil calificat verifică mai întâi contestația.</li></ul>"""

# ---------------------------------------------------------------- 1
page(
 slug="amenda-hmrc-100-lire-depunere-tarzie",
 chip="Amenda de £100 pentru depunere târzie",
 title="Amenda HMRC de £100 pentru depunerea târzie a declarației: ce înseamnă și cum o contestați",
 meta_title="Amenda HMRC de £100 (late filing penalty) – ce înseamnă și cum o contestați | Tax Letter Sorted",
 desc="Ați primit de la HMRC o amendă de £100 pentru depunerea târzie a declarației Self Assessment? Ce înseamnă, ce se întâmplă dacă o ignorați, ce motive acceptă HMRC și cum faceți contestație cu formularul SA370.",
 lead="HMRC aplică o amendă fixă de £100 când declarația fiscală anuală (Self Assessment tax return) ajunge după termenul limită. Amenda se aplică și dacă nu datorați niciun impozit sau dacă ați plătit impozitul la timp.",
 facts=[("Amenda","£100, sumă fixă"),("Termen declarație online","31 ianuarie după sfârșitul anului fiscal (pe hârtie: 31 octombrie)"),("Termen de contestație","30 de zile de la data de pe notificarea de amendă"),("Termen de plată","30 de zile de la data de pe notificarea de amendă, dacă nu contestați")],
 body="""
<h2>De ce ați primit această scrisoare</h2>
<p>Scrisoarea (de obicei formularul SA326D) înseamnă că HMRC nu a primit declarația fiscală anuală până la termenul limită. Pentru o declarație online, termenul este 31 ianuarie după sfârșitul anului fiscal. De exemplu, declarația pentru 2024-25 trebuia depusă până la 31 ianuarie 2026.</p>
<p>Amenda de £100 se aplică indiferent dacă datorați sau nu impozit. Chiar dacă nu ați avut venituri de declarat, amenda rămâne, cu excepția cazului în care HMRC acceptă că nu trebuia să depuneți declarația.</p>
<h3>Verificați înainte să plătiți</h3>
<ul class="list">
<li><b>Ați depus la timp?</b> Căutați confirmarea de depunere online (submission receipt). Dacă arată că declarația a ajuns înainte de termen, HMRC poate să fi greșit și puteți contesta cu această dovadă.</li>
<li><b>HMRC v-a cerut declarația târziu?</b> Dacă HMRC v-a trimis notificarea de depunere (notice to file) după 31 octombrie, termenul dvs. este de 3 luni de la data acelei notificări, nu 31 ianuarie.</li>
<li><b>Nu trebuia să depuneți declarația?</b> Dacă nu trebuia să fiți în Self Assessment pentru acel an, cereți HMRC să anuleze declarația și amenda.</li>
</ul>

<h2>Ce se întâmplă dacă nu faceți nimic</h2>
<p>Amenda de £100 este doar începutul. Dacă declarația tot nu este depusă:</p>
<table class="tbl"><thead><tr><th>Întârziere</th><th>Amendă suplimentară</th></tr></thead><tbody>
<tr><td>3 luni</td><td>£10 pe zi, timp de cel mult 90 de zile (până la £900)</td></tr>
<tr><td>6 luni</td><td>5% din impozitul datorat sau £300, care dintre ele este mai mare</td></tr>
<tr><td>12 luni</td><td>Încă 5% din impozitul datorat sau £300, care dintre ele este mai mare</td></tr>
</tbody></table>
<p>Așadar, cel mai util lucru pe care îl puteți face imediat este să <b>depuneți declarația</b>, chiar înainte să vă ocupați de amendă. <a href="amenzi-zilnice-6-12-luni-self-assessment.html">Mai multe despre amenzile zilnice și cele de 6 și 12 luni</a>.</p>

<h2>Puteți contesta?</h2>
<p>HMRC anulează amenda dacă ați avut un <b>motiv întemeiat (reasonable excuse)</b>: ceva neprevăzut sau în afara controlului dvs. v-a împiedicat să depuneți la timp, iar ați depus cât de repede ați putut după ce problema s-a încheiat.</p>
<p>Exemple date de HMRC:</p>
<ul class="list">
<li>decesul partenerului sau al unei rude apropiate cu puțin timp înainte de termen</li>
<li>o internare neprevăzută în spital sau o boală gravă ori care v-a pus viața în pericol</li>
<li>calculatorul sau programul s-a defectat în timp ce pregăteați declarația</li>
<li>serviciile online HMRC nu funcționau</li>
<li>un incendiu, o inundație sau un furt v-a împiedicat să completați declarația</li>
</ul>
<p>De obicei <b>nu</b> sunt acceptate: faptul că sistemul online vi s-a părut prea complicat, că nu ați primit un memento de la HMRC sau că nu aveați bani să plătiți. Lista completă HMRC este pe <a href="https://www.gov.uk/tax-appeals/reasonable-excuses" rel="nofollow">GOV.UK</a> (în engleză).</p>
<p>Contestația trebuie să fie adevărată și să se bazeze pe ce s-a întâmplat de fapt. Nu vă sugerăm niciodată un motiv – folosim doar faptele pe care le confirmați dvs.</p>

<h2>Cum faceți contestație</h2>
<ol class="list">
<li><b>Depuneți mai întâi declarația</b>, dacă nu ați făcut-o deja.</li>
<li><b>Contestați în 30 de zile</b> de la data de pe notificarea de amendă. O contestație mai târzie poate fi acceptată dacă explicați de ce întârzie.</li>
<li><b>Alegeți cum o trimiteți:</b> online, prin serviciul de contestații HMRC, sau pe formularul <b>SA370</b>, prin poștă, la: Self Assessment, HM Revenue and Customs, BX9 1AS.</li>
<li><b>Includeți date și dovezi:</b> când a început și s-a terminat problema, când ați depus declarația și orice o susține (de exemplu, o scrisoare de la spital).</li>
</ol>
<p>Nu trebuie să plătiți amenda cât timp HMRC analizează contestația. Dacă este respinsă, veți datora dobândă de la data scadentă inițială. Dacă nu sunteți de acord cu decizia HMRC, puteți cere o reanalizare (review) sau vă puteți adresa tribunalului fiscal.</p>
<p class="small">Contestația către HMRC se face întotdeauna în engleză.</p>
""",
 help="""<p>Încărcați notificarea de amendă și vă explicăm totul pe înțeles, în română sau engleză, cu termenele dvs. exacte – gratuit. Dacă motivul dvs. este unul pe care HMRC îl poate accepta, alegeți cum contestați:</p>""" + FREE_SA,
 faq=[
  ("Trebuie să plătesc £100 dacă nu datorez impozit?","Da. Amenda este pentru depunerea târzie a declarației, nu pentru plata târzie, așa că se aplică și dacă nu datorați impozit. Dacă nu trebuia să depuneți deloc declarația, puteți cere HMRC să o anuleze."),
  ("Pot contesta după 30 de zile?","Da. HMRC poate accepta o contestație târzie dacă explicați de ce nu ați putut contesta la timp, de exemplu pentru că ați fost în spital."),
  ("Am depus la timp, dar tot am primit amenda. Ce fac?","Păstrați confirmarea de depunere online și faceți contestație, arătând că declarația a fost primită la timp. HMRC ar trebui să anuleze amenda dacă evidențele sale sunt greșite."),
  ("Este un motiv întemeiat faptul că am fost prea ocupat sau am uitat?","De obicei nu. HMRC caută ceva neprevăzut sau în afara controlului dvs. care v-a împiedicat să depuneți și se așteaptă să depuneți imediat ce problema a trecut."),
 ],
 sources=[("Self Assessment penalties (GOV.UK, în engleză)","https://www.gov.uk/self-assessment-tax-returns/penalties"),("Reasonable excuses (GOV.UK, în engleză)","https://www.gov.uk/tax-appeals/reasonable-excuses"),("SA370 – cum contestați (GOV.UK, în engleză)","https://www.gov.uk/government/publications/self-assessment-appeal-against-penalties-for-late-filing-and-late-payment-sa370")],
)

# ---------------------------------------------------------------- 2
page(
 slug="amenzi-zilnice-6-12-luni-self-assessment",
 chip="Amenzi zilnice, de 6 și 12 luni",
 title="Amenzile zilnice HMRC și amenzile de 6 și 12 luni pentru depunere târzie",
 meta_title="Amenda HMRC de £10 pe zi și amenzile de 6 și 12 luni (Self Assessment) | Tax Letter Sorted",
 desc="Scrisoare HMRC despre £10 pe zi, £300 sau 5% pentru declarația Self Assessment depusă târziu? Cum funcționează amenzile zilnice și cele de 6 și 12 luni și cum le contestați pe un singur SA370.",
 lead="Dacă declarația Self Assessment întârzie mai mult de 3 luni, HMRC adaugă alte amenzi peste cea de £100: £10 pe zi, apoi 5% sau £300 la 6 luni și din nou la 12 luni.",
 facts=[("Scrisoarea","Notificare de amendă (Notice of penalty assessment, formularul SA370)"),("3 luni întârziere","£10 pe zi, timp de cel mult 90 de zile – maximum £900"),("6 luni întârziere","5% din impozitul datorat sau £300, care dintre ele este mai mare"),("12 luni întârziere","Încă 5% din impozitul datorat sau £300, care dintre ele este mai mare"),("Termen de contestație","30 de zile de la data de pe notificarea de amendă")],
 body="""
<h2>Cum se adună amenzile</h2>
<p>Pentru o declarație online cu termen 31 ianuarie, dacă declarația tot nu este depusă:</p>
<table class="tbl"><thead><tr><th>Întârziere</th><th>Amendă</th><th>Total (cel puțin)</th></tr></thead><tbody>
<tr><td>1 zi</td><td>£100</td><td>£100</td></tr>
<tr><td>3 luni</td><td>£10 pe zi, cel mult 90 de zile</td><td>£1.000</td></tr>
<tr><td>6 luni</td><td>5% din impozitul datorat sau £300</td><td>£1.300</td></tr>
<tr><td>12 luni</td><td>Încă 5% din impozitul datorat sau £300</td><td>£1.600</td></tr>
</tbody></table>
<p>Amenzile zilnice se opresc după 90 de zile. Amenzile pentru plata târzie și dobânda sunt separate și se adaugă peste acestea.</p>

<h2>Dacă declarația tot nu este depusă</h2>
<p>Pentru amenzile de 6 și 12 luni, HMRC estimează impozitul pe care crede că îl datorați și calculează cei 5% pe această estimare. Depunerea declarației înlocuiește estimarea cu cifrele reale, ceea ce poate reduce aceste amenzi – iar dacă depuneți înainte de 12 luni, evitați amenda de 12 luni.</p>
<p>La 12 luni, amenda poate fi mult mai mare de 5% dacă HMRC consideră că informațiile au fost ascunse intenționat. Atunci aveți nevoie de un contabil, nu de o contestație pe cont propriu.</p>

<h2>Verificați scrisoarea</h2>
<ul class="list">
<li><b>Datele:</b> dacă ați depus la mai puțin de 3 luni după termen, nu ar trebui să aveți amenzi zilnice. Dacă le aveți totuși, HMRC poate să fi greșit.</li>
<li><b>Suma:</b> amenzile de 6 și 12 luni ar trebui să fie de £300 sau 5% din impozitul datorat, dacă acesta este mai mare. O sumă mult mai mare trebuie verificată.</li>
<li><b>Același an fiscal:</b> toate amenzile pentru depunere târzie dintr-un an fiscal – inclusiv cea de £100 – pot fi contestate pe <b>un singur SA370</b>, care are o secțiune pentru fiecare amendă.</li>
</ul>

<h2>Puteți contesta?</h2>
<p>Regula este aceeași ca pentru amenda de £100: un <b>motiv întemeiat (reasonable excuse)</b> care a durat toată perioada și v-a împiedicat să depuneți, iar apoi ați depus cât de repede ați putut. Pentru întârzieri lungi, HMRC verifică atent toată perioada – o boală scurtă nu explică o declarație depusă cu 9 luni întârziere.</p>
<p>Exemplele HMRC includ un deces în familie cu puțin timp înainte de termen, o internare neprevăzută sau o boală gravă, defectarea calculatorului sau a serviciilor online HMRC, un incendiu, o inundație sau un furt. Vedeți <a href="https://www.gov.uk/tax-appeals/reasonable-excuses" rel="nofollow">lista completă pe GOV.UK</a> (în engleză).</p>

<h2>Cum faceți contestație</h2>
<ol class="list">
<li>Depuneți declarația, dacă nu este încă depusă.</li>
<li>Contestați în 30 de zile de la data de pe fiecare notificare de amendă (pentru o contestație mai târzie trebuie să explicați motivul întârzierii).</li>
<li>Contestați online sau trimiteți formularul SA370 prin poștă la: Self Assessment, HM Revenue and Customs, BX9 1AS.</li>
<li>Indicați când a început și când s-a terminat problema și ce dovezi aveți.</li>
</ol>
""",
 help="""<p>Încărcați scrisorile de amendă – explicație gratuită pentru fiecare, cu termenele și totalul. Dacă puteți contesta, alegeți cum:</p>""" + FREE_SA.replace("completăm formularul oficial SA370;", "completăm un singur SA370 pentru toate amenzile din acel an;") + "<p>Același preț, indiferent de sumă.</p>",
 faq=[
  ("Când încep amenzile zilnice HMRC?","Când declarația întârzie 3 luni. Pentru o declarație cu termen 31 ianuarie, de la 1 mai. Sunt £10 pe zi, timp de cel mult 90 de zile."),
  ("Pot contesta împreună amenda de £100 și amenzile zilnice?","Da. Amenzile din același an fiscal pot fi trecute pe un singur formular SA370, cu o secțiune pentru fiecare amendă."),
  ("De ce amenda de 6 luni este mai mare de £300?","Este 5% din impozitul datorat, dacă acesta depășește £300. Dacă nu ați depus declarația, HMRC folosește propria estimare a impozitului – depunerea declarației o înlocuiește."),
  ("Dacă depun acum declarația, se opresc amenzile?","Nu se mai adaugă alte amenzi pentru depunere târzie, iar estimarea HMRC este înlocuită. Amenzile deja aplicate nu se anulează – pentru asta trebuie să contestați."),
 ],
 sources=[("Self Assessment penalties (GOV.UK, în engleză)","https://www.gov.uk/self-assessment-tax-returns/penalties"),("Reasonable excuses (GOV.UK, în engleză)","https://www.gov.uk/tax-appeals/reasonable-excuses"),("SA370 – cum contestați (GOV.UK, în engleză)","https://www.gov.uk/government/publications/self-assessment-appeal-against-penalties-for-late-filing-and-late-payment-sa370")],
)

# ---------------------------------------------------------------- 3
page(
 slug="amenda-plata-tarzie-self-assessment",
 chip="Amenda pentru plata târzie",
 title="Amenda HMRC pentru plata târzie a impozitului Self Assessment: 5% pe înțeles",
 meta_title="Amenda HMRC pentru plata târzie (late payment penalty) 5% – explicată | Tax Letter Sorted",
 desc="HMRC v-a aplicat o amendă de 5% pentru plata târzie? Cum funcționează amenzile și dobânda pentru plata târzie a impozitului Self Assessment, ce faceți dacă nu puteți plăti și când puteți contesta.",
 lead="Dacă impozitul din declarația Self Assessment nu este plătit la 30 de zile după termenul de plată, HMRC aplică o amendă de 5% din impozitul neplătit – și din nou la 6 și la 12 luni.",
 facts=[("Termen de plată","31 ianuarie după sfârșitul anului fiscal"),("30 de zile întârziere","5% din impozitul încă neplătit"),("6 luni întârziere","Încă 5% din impozitul încă neplătit"),("12 luni întârziere","Încă 5% din impozitul încă neplătit"),("Dobânda","Se adaugă de la data scadentă – dobânda nu poate fi contestată")],
 body="""
<h2>Ce înseamnă scrisoarea</h2>
<p>Notificarea (formularul SA370, cu titlul „Late payment penalties”) arată impozitul neplătit la o anumită dată și amenda de 5% calculată pe acesta. Pe pagina 2 apare de obicei suma exactă folosită de HMRC.</p>
<p>Această amendă este separată de amenda pentru depunerea târzie a declarației. Le puteți datora pe amândouă pentru același an.</p>

<h2>Dobânda este altceva</h2>
<p>HMRC percepe și dobândă pentru impozitul plătit târziu, din ziua de după scadență până la plată. Dobânda nu este o amendă, deci nu poate fi contestată – dar dacă amenda este anulată, dispare și dobânda pentru acea amendă.</p>

<h2>Dacă nu puteți plăti</h2>
<p>Lipsa banilor nu este, singură, un motiv întemeiat. Ce vă ajută:</p>
<ul class="list">
<li><b>Plătiți acum cât puteți</b> – amenzile de 5% și dobânda se calculează la suma rămasă neplătită.</li>
<li><b>Faceți un plan de plată</b> (Time to Pay). De multe ori îl puteți face online dacă datorați cel mult £30.000, sau sunați la HMRC la 0300 200 3820.</li>
<li><b>Aveați deja un plan de plată înainte de data amenzii?</b> Contactați HMRC în legătură cu amenda, pentru că s-ar putea să nu se aplice.</li>
</ul>

<h2>Puteți contesta?</h2>
<p>Da, dacă un <b>motiv întemeiat (reasonable excuse)</b> v-a împiedicat să plătiți la timp și ați plătit imediat ce ați putut. Exemplele HMRC includ o boală gravă sau o internare neprevăzută, un deces în familie cu puțin timp înainte de termen, defectarea sistemelor online HMRC, un incendiu, o inundație sau un furt. O plată respinsă pentru că nu erau bani suficienți în cont, de obicei, nu este acceptată.</p>
<p>Vedeți <a href="https://www.gov.uk/tax-appeals/reasonable-excuses" rel="nofollow">lista completă pe GOV.UK</a> (în engleză).</p>

<h2>Cum faceți contestație</h2>
<ol class="list">
<li>Contestați în 30 de zile de la data de pe notificarea de amendă (pentru o contestație mai târzie trebuie să explicați motivul întârzierii).</li>
<li>Contestați online sau trimiteți formularul SA370 prin poștă la: Self Assessment, HM Revenue and Customs, BX9 1AS.</li>
<li>Amenzile pentru depunere târzie și pentru plată târzie din același an fiscal pot fi trecute pe același SA370.</li>
</ol>
<p class="small">Această pagină se referă la anii fiscali până la 2025-26. Din 2026-27, persoanele intrate în Making Tax Digital for Income Tax au alte reguli privind amenzile.</p>
""",
 help="""<p>Încărcați notificarea pentru o explicație gratuită a amenzii, a dobânzii și a termenelor. Dacă motivul dvs. poate fi acceptat, alegeți cum contestați:</p>""" + FREE_SA + "<p>Dacă nu, vă arătăm în schimb opțiunile de plată.</p>",
 faq=[
  ("Cât este amenda HMRC pentru plata târzie?","5% din impozitul încă neplătit la 30 de zile după termen, apoi încă 5% din ce a rămas neplătit la 6 luni și din nou la 12 luni. Dobânda se adaugă separat."),
  ("Faptul că nu îmi permit să plătesc este un motiv întemeiat?","Nu, nu singur. Faceți un plan de plată cu HMRC cât mai devreme."),
  ("Pot contesta dobânda?","Nu. Dobânda nu poate fi contestată. Dacă amenda este anulată, dispare și dobânda aferentă amenzii."),
 ],
 sources=[("Self Assessment penalties (GOV.UK, în engleză)","https://www.gov.uk/self-assessment-tax-returns/penalties"),("Reasonable excuses (GOV.UK, în engleză)","https://www.gov.uk/tax-appeals/reasonable-excuses"),("Plata în rate a impozitului Self Assessment (GOV.UK, în engleză)","https://www.gov.uk/pay-self-assessment-tax-bill/pay-in-instalments")],
)

# ---------------------------------------------------------------- 4
page(
 slug="amenda-corporation-tax-depunere-tarzie",
 kind="co",
 chip="Amenda Corporation Tax",
 title="Amenda pentru depunerea târzie a declarației Corporation Tax: noile amenzi de £200",
 meta_title="Amenda Corporation Tax pentru depunere târzie – £200 din aprilie 2026 | Tax Letter Sorted",
 desc="Amendă HMRC pentru depunerea târzie a declarației companiei (CT600)? Amenzile dublate din 1 aprilie 2026, amenzile calculate pe impozit și cum poate contesta directorul.",
 lead="Dacă declarația fiscală a companiei (CT600) ajunge la HMRC după termenul limită, HMRC amendează compania. Pentru declarațiile cu termen la 1 aprilie 2026 sau după, amenzile fixe s-au dublat.",
 facts=[("Termen de depunere","12 luni de la sfârșitul perioadei contabile"),("1 zi întârziere","£200 (înainte £100)"),("3 luni întârziere","Încă £200 – £400 în total (înainte £200)"),("Întârziere de 3 ori la rând","£1.000, și £2.000 dacă întârzie 3 luni"),("Termen de contestație","30 de zile de la data notificării de amendă")],
 body="""
<h2>Scrisoarea este de la HMRC, nu de la Companies House</h2>
<p>În fiecare an, compania trimite două lucruri diferite: declarația fiscală a companiei la <b>HMRC</b> și bilanțul financiar anual (annual accounts) la <b>Companies House</b>. Fiecare are propriul termen și propria amendă. Dacă scrisoarea dvs. este de la Companies House, vedeți <a href="amenda-companies-house-depunere-tarzie.html">amenda Companies House pentru depunere târzie</a>.</p>

<h2>Amenzile fixe</h2>
<table class="tbl"><thead><tr><th>Întârziere</th><th>Termen înainte de 1 aprilie 2026</th><th>Termen la 1 aprilie 2026 sau după</th></tr></thead><tbody>
<tr><td>1 zi</td><td>£100</td><td>£200</td></tr>
<tr><td>3 luni</td><td>încă £100 (£200 total)</td><td>încă £200 (£400 total)</td></tr>
<tr><td>De 3 ori la rând</td><td>£500</td><td>£1.000</td></tr>
<tr><td>De 3 ori la rând, 3 luni întârziere</td><td>£1.000</td><td>£2.000</td></tr>
</tbody></table>
<p>Noile sume depind de <b>termenul de depunere</b> al declarației, nu de data la care s-a încheiat perioada contabilă. Dacă suma din scrisoare nu se potrivește cu coloana corectă, merită verificată.</p>

<h2>Când devine mai grav</h2>
<p>Dacă declarația întârzie 6 luni (18 luni de la sfârșitul perioadei contabile), HMRC poate estima impozitul companiei (tax determination) și poate aplica o amendă de <b>10% din impozitul neplătit</b>. Aceasta crește la <b>20%</b> dacă declarația nu este depusă în 2 ani de la sfârșitul perioadei.</p>
<p>Estimarea HMRC (tax determination) nu poate fi contestată – singura cale de a o înlocui este să depuneți declarația reală și să plătiți impozitul.</p>

<h2>Poate compania să conteste?</h2>
<p>Da, dacă a avut un <b>motiv întemeiat (reasonable excuse)</b> și a depus cât de repede a putut. Exemple obișnuite sunt boala gravă sau decesul directorului care se ocupă de declarație, când nimeni altcineva nu o putea depune, defectarea serviciilor online HMRC sau un incendiu ori o inundație care a distrus evidențele. De obicei HMRC se așteaptă ca ceilalți directori să preia sarcina, așa că boala unui director contează mai puțin dacă mai există și alții.</p>

<h2>Cum faceți contestație</h2>
<ol class="list">
<li><b>Depuneți mai întâi declarația și plătiți impozitul</b> – HMRC poate să nu analizeze contestația până nu le are pe amândouă.</li>
<li>Contestați în 30 de zile de la data de pe notificarea de amendă.</li>
<li>Folosiți formularul online HMRC de contestație, apoi tipăriți-l și trimiteți-l prin poștă la: Corporation Tax Services, HM Revenue and Customs, BX9 1AX. Puteți și să scrieți la adresa de pe notificarea de amendă.</li>
<li>Semnează un director (sau secretarul companiei). Includeți numele companiei, referința Corporation Tax (UTR) și perioada contabilă.</li>
</ol>
<p>Dacă HMRC respinge contestația, compania poate cere o reanalizare (review) sau se poate adresa tribunalului fiscal în 30 de zile.</p>
""",
 help="""<p>Încărcați notificarea de amendă pentru o explicație gratuită, cu termenele și verificarea sumei. Dacă puteți contesta, alegeți cum:</p><ul class="list"><li><b>Gratuit</b> – contestați singur online: copiați și lipiți textul nostru (aveți nevoie de datele de autentificare HMRC ale companiei).</li><li><b>£59</b> – un contabil calificat pregătește contestația și o trimite la HMRC în locul dvs.</li></ul>""",
 faq=[
  ("Cât este amenda Corporation Tax pentru depunere târzie în 2026?","Pentru declarațiile cu termen la 1 aprilie 2026 sau după: £200 dacă declarația întârzie, încă £200 la 3 luni și £1.000 sau £2.000 dacă este a treia declarație întârziată la rând."),
  ("Amenda HMRC este aceeași cu amenda Companies House?","Nu. Sunt amenzi separate, de la instituții diferite, pentru documente diferite. O companie le poate primi pe amândouă pentru același an."),
  ("Putem contesta înainte să depunem declarația?","Puteți trimite contestația, dar HMRC poate să nu o analizeze până nu este depusă declarația și plătit impozitul, așa că depuneți întâi."),
 ],
 sources=[("Increases to Corporation Tax late filing penalties (GOV.UK, în engleză)","https://www.gov.uk/government/publications/corporation-tax-increases-to-late-filing-penalties/increases-to-corporation-tax-late-filing-penalties"),("Corporation Tax: penalty determinations – CT211 (GOV.UK, în engleză)","https://www.gov.uk/government/publications/corporation-tax-penalty-determinations-ct211-notes/corporation-tax-penalty-determinations-ct211-notes")],
)

# ---------------------------------------------------------------- 5
page(
 slug="amenda-companies-house-depunere-tarzie",
 kind="co",
 chip="Amenda Companies House",
 title="Amenda Companies House pentru depunerea târzie a bilanțului: sume și contestație",
 meta_title="Amenda Companies House (late filing penalty) – sume și contestație | Tax Letter Sorted",
 desc="Ați primit o amendă de la Companies House pentru bilanțul financiar anual depus târziu? Sumele amenzilor, de ce se dublează, regula strictă pentru contestații și ce se întâmplă dacă nu plătiți.",
 lead="Companies House aplică o amendă când bilanțul financiar anual al companiei (annual accounts) ajunge după termenul limită. Nu este HMRC – iar contestația este mai grea decât în cazul unei amenzi HMRC.",
 facts=[("Termen (companie privată)","9 luni de la sfârșitul exercițiului financiar (primul bilanț: 21 de luni de la înființare)"),("Până la 1 lună întârziere","£150"),("1–3 luni întârziere","£375"),("3–6 luni întârziere","£750"),("Peste 6 luni întârziere","£1.500"),("Întârziere 2 ani la rând","Amenda se dublează")],
 body="""
<h2>Scrisoarea este de la Companies House</h2>
<p>Companies House este registrul companiilor. Este separat de HMRC, așa că această amendă este pentru <b>bilanțul financiar anual</b>, nu pentru declarația fiscală a companiei. Dacă HMRC v-a amendat pentru declarația fiscală, vedeți <a href="amenda-corporation-tax-depunere-tarzie.html">amenda Corporation Tax pentru depunere târzie</a>.</p>

<h2>Sumele amenzilor</h2>
<table class="tbl"><thead><tr><th>Întârziere</th><th>Companie privată sau LLP</th><th>Companie publică</th></tr></thead><tbody>
<tr><td>Până la 1 lună</td><td>£150</td><td>£750</td></tr>
<tr><td>1–3 luni</td><td>£375</td><td>£1.500</td></tr>
<tr><td>3–6 luni</td><td>£750</td><td>£3.000</td></tr>
<tr><td>Peste 6 luni</td><td>£1.500</td><td>£7.500</td></tr>
</tbody></table>
<p>Dacă bilanțul a întârziat și în anul anterior, amenda se <b>dublează</b>. Dacă suma din scrisoare nu corespunde întârzierii, verificați-o.</p>

<h2>Puteți contesta?</h2>
<p>Doar în <b>circumstanțe excepționale</b> (exceptional circumstances) – Companies House are o libertate de decizie foarte limitată. Un exemplu dat de Companies House este un incendiu care a distrus evidențele companiei cu câteva zile înainte de termen. Alte cazuri care pot reuși: boala gravă sau decesul unui director într-un moment critic, când nimeni altcineva nu putea depune, sau o defecțiune a sistemului Companies House chiar în ziua respectivă.</p>
<p>Companies House spune că acestea <b>nu</b> sunt acceptate singure:</p>
<ul class="list">
<li>compania este inactivă (dormant) sau era primul ei bilanț</li>
<li>compania nu își permite să plătească sau are dificultăți financiare</li>
<li>contabilul a fost bolnav sau directorii s-au bazat pe contabil</li>
<li>directorii nu cunoșteau regulile sau locuiau ori călătoreau în străinătate</li>
<li>de bilanț se ocupa alt director</li>
<li>bilanțul a întârziat sau s-a pierdut prin poștă</li>
</ul>

<h2>Cum faceți contestație</h2>
<ol class="list">
<li>Contestați online, prin serviciul de contestații Companies House, sau pe e-mail la enquiries@companieshouse.gov.uk. Includeți <b>referința amenzii</b> (penalty reference) și <b>numărul companiei</b> (company number).</li>
<li>Explicați ce s-a întâmplat, cu date, și atașați dovezi.</li>
<li>Dacă vi se respinge contestația, puteți cere Senior Casework Unit să o reanalizeze, iar după aceea Independent Adjudicators.</li>
</ol>
<p>Nu există un termen fix, dar contestați imediat – amenzile neplătite sunt trimise la firme de recuperare a datoriilor și pot ajunge în instanță (County Court sau, în Scoția, Sheriff Court). Dacă nu puteți plăti dintr-odată, puteți cere Companies House plata în rate lunare.</p>
<p class="small">Contestația către Companies House se face în engleză.</p>
""",
 help="""<p>Încărcați scrisoarea Companies House pentru o explicație gratuită și verificarea sumei față de întârziere. Dacă situația dvs. poate fi acceptată, alegeți cum contestați:</p><ul class="list"><li><b>Gratuit</b> – contestați singur online: copiați și lipiți textul nostru în serviciul de contestații Companies House.</li><li><b>£59</b> – un contabil calificat pregătește contestația pentru dvs.</li></ul><p>Dacă nu, vă arătăm cum plătiți sau cum cereți plata în rate.</p>""",
 faq=[
  ("Amenda Companies House este aceeași cu o amendă HMRC?","Nu. Companies House amendează compania pentru bilanțul depus târziu; HMRC o amendează separat pentru declarația fiscală depusă târziu. S-ar putea să trebuiască să vă ocupați de amândouă."),
  ("Compania mea este inactivă (dormant) – trebuie totuși să plătesc?","Da. Faptul că firma este inactivă nu este un motiv acceptat de Companies House. Și companiile inactive trebuie să depună bilanțul la timp."),
  ("Pot plăti amenda Companies House în rate?","Puteți cere. Contactați Companies House, de preferat pe e-mail, și explicați de ce nu puteți plăti toată suma odată."),
 ],
 sources=[("Late filing penalties – Companies House (GOV.UK, în engleză)","https://www.gov.uk/government/publications/late-filing-penalties-from-companies-house/late-filing-penalties"),("Annual accounts: penalties for late filing (GOV.UK, în engleză)","https://www.gov.uk/annual-accounts/penalties-for-late-filing")],
)

# ---------------------------------------------------------------- 6
page(
 slug="scrisoare-hmrc-vanzari-online",
 kind="nudge",
 chip="Scrisori „nudge” (vânzări online)",
 title="Scrisorile HMRC „nudge” și scrisorile pentru vânzătorii online: ce faceți",
 meta_title="Scrisoare HMRC despre vânzări pe Vinted, eBay, Etsy sau Airbnb | Tax Letter Sorted",
 desc="Ați primit o scrisoare de la HMRC despre venituri din Vinted, eBay, Etsy, Airbnb sau altă platformă? Ce înseamnă o scrisoare „nudge”, când vânzările online sunt impozabile, scutirea de £1.000 și cum răspundeți.",
 lead="O scrisoare „nudge” înseamnă că HMRC vă cere să vă verificați situația fiscală, pentru că are informații că s-ar putea să aveți venituri nedeclarate – de multe ori din vânzări online. Nu este o amendă și nici o investigație, dar nu o ignorați.",
 facts=[("Ce este","O cerere de a vă verifica situația fiscală – nu o amendă"),("Platformele online","Raportează vânzătorii la HMRC în fiecare ianuarie, începând cu anul 2024"),("Sunteți raportat dacă","Aveți 30 sau mai multe vânzări, sau aproximativ £1.700 (€2.000) sau mai mult, într-un an"),("Scutirea pentru activități comerciale","Până la £1.000 pe an din activități comerciale (trading allowance) pot fi neimpozabile"),("Răspunsul dvs.","Până la data din scrisoare, dacă există una")],
 body="""
<h2>De ce v-a scris HMRC</h2>
<p>Din 1 ianuarie 2024, site-urile și aplicațiile precum eBay, Vinted, Etsy și Airbnb trebuie să colecteze datele vânzătorilor și să le raporteze la HMRC în fiecare ianuarie. HMRC compară aceste date cu declarațiile fiscale și le scrie persoanelor ale căror venituri par nedeclarate.</p>
<p>Datele dvs. sunt raportate dacă aveți 30 sau mai multe vânzări, sau primiți aproximativ £1.700 (€2.000) sau mai mult, într-un an calendaristic. <b>Faptul că ați fost raportat nu înseamnă că datorați impozit.</b></p>
<p>HMRC trimite scrisori asemănătoare și pentru alte venituri, de exemplu din chirii, din străinătate sau din cripto, precum și când aștepta o declarație fiscală care nu a sosit.</p>

<h2>Sunt vânzările online impozabile?</h2>
<ul class="list">
<li><b>Vânzarea propriilor lucruri de care nu mai aveți nevoie</b> – haine, lucruri din pod – pe mai puțin decât ați dat pe ele, de obicei nu este activitate comercială și de obicei nu se impozitează.</li>
<li><b>Cumpărarea sau producerea de lucruri ca să le vindeți cu profit</b> este, cel mai probabil, activitate comercială (trading), iar profitul se impozitează.</li>
<li>Dacă venitul din activitatea comercială este de cel mult £1.000 într-un an fiscal, <b>scutirea pentru activități comerciale</b> (trading allowance) înseamnă de obicei că nu trebuie să îl declarați la HMRC.</li>
</ul>
<p>Închirierea unei camere sau a unei proprietăți (de exemplu prin Airbnb) are reguli proprii, inclusiv o scutire separată de £1.000 pentru venituri din proprietăți (property allowance) și schema Rent a Room.</p>

<h2>Ce faceți acum</h2>
<ol class="list">
<li>Notați data până la care HMRC vă cere să răspundeți.</li>
<li>Stabiliți ce ați vândut și dacă erau lucrurile dvs. personale sau activitate comercială. Platformele vă trimit o copie a ceea ce au raportat.</li>
<li>Dacă datorați impozit, anunțați HMRC și depuneți declarațiile. Dacă recunoașteți singur înainte ca HMRC să vă întrebe din nou, de obicei amenzile sunt mai mici.</li>
<li>Dacă nu datorați nimic, răspundeți și spuneți acest lucru – păstrați evidențele, în caz că HMRC le cere.</li>
</ol>
<p>Dacă scrisoarea menționează o <b>verificare de conformitate</b> (compliance check) sau vă cere documente într-un anumit termen, este mai mult decât o scrisoare „nudge” – vorbiți cu un contabil.</p>
""",
 help="""<p>Încărcați scrisoarea pentru o explicație gratuită, pe înțeles, în română sau engleză: ce vă cere HMRC, termenul dvs. și opțiunile pe care le aveți. Dacă aveți nevoie de ajutor cu o declarație fiscală sau cu un răspuns, puteți cere să vă sune un contabil calificat.</p>""",
 faq=[
  ("Trebuie să plătesc impozit pe lucrurile vândute pe Vinted sau eBay?","De obicei nu, dacă ați vândut lucrurile dvs. personale folosite. Cumpărarea sau producerea de lucruri pentru a le vinde cu profit este activitate comercială, iar profitul peste scutirea de £1.000 se impozitează."),
  ("O scrisoare „nudge” este o investigație?","Nu. Vă cere să vă verificați situația fiscală și să o corectați dacă e nevoie. Dacă o ignorați, HMRC poate deschide mai târziu o verificare oficială."),
  ("Am fost raportat de o platformă. Înseamnă că datorez impozit?","Nu. Platformele raportează pe toți cei peste prag. Dacă datorați impozit depinde de ce ați vândut și dacă a fost activitate comercială."),
 ],
 sources=[("Selling goods or services on a digital platform (GOV.UK, în engleză)","https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform"),("Check if you need to send a Self Assessment tax return (GOV.UK, în engleză)","https://www.gov.uk/check-if-you-need-tax-return")],
)

DIFF_RO = {
 "sa": "Această pagină explică regulile generale. Încărcați scrisoarea dvs. și o citim pe cea reală, verificăm dacă amenda este corectă, vă spunem termenul exact și – dacă motivul dvs. este unul acceptat de HMRC – completăm pentru dvs. formularul SA370 în engleză, chiar dacă răspundeți în română.",
 "co": "Această pagină explică regulile generale. Încărcați scrisoarea dvs. și o citim pe cea reală, verificăm suma față de întârziere, vă spunem termenul exact și – dacă motivul poate fi acceptat – pregătim textul contestației în engleză, chiar dacă răspundeți în română.",
 "nudge": "Această pagină explică regulile generale. Încărcați scrisoarea dvs. și o citim pe cea reală, vă spunem ce vă cere HMRC și până când și vă explicăm opțiunile pe înțeles, în română sau engleză.",
}

UI_RO = {
 "lang": "ro", "html_lang": "ro", "og_locale": "ro_RO", "in_language": "ro",
 "dir": "ro/scrisori", "up": "../../", "q": "?lang=ro",
 "upload_short": "Încărcați o scrisoare",
 "cta": "Încărcați scrisoarea – explicație gratuită",
 "note": "Explicație gratuită în română sau engleză · Fără cont",
 "key_facts": "Pe scurt",
 "different": "Fiecare scrisoare este diferită.",
 "mid_title": "Verificați-mi datele și termenele",
 "mid_text": "Nu știți sigur ce amendă aveți, dacă suma este corectă sau când este exact termenul? Încărcați scrisoarea și o verificăm pentru dvs. – gratuit.",
 "mid_text_nudge": "Nu știți sigur ce vă cere HMRC sau până când trebuie să răspundeți?",
 "mid_btn": "Verificați-mi scrisoarea – gratuit",
 "helps": "Cum vă ajută Tax Letter Sorted",
 "questions": "Întrebări",
 "checked": "Verificat după GOV.UK la {d}:",
 "disclaimer": "<strong>Nu suntem HMRC sau Companies House.</strong> Această pagină oferă îndrumări generale, nu consultanță fiscală personală. Cazurile complexe sunt preluate de un contabil calificat.",
 "translation": "Această pagină este o traducere. Versiunea în engleză este cea oficială.",
 "other": "Alte scrisori pe care le explicăm",
 "all": "Toate scrisorile",
 "home": "Acasă",
 "hub_name": "Scrisori explicate",
 "privacy": "Politica de confidențialitate", "terms": "Termeni", "contact": "Contact",
 "footer": "Tax Letter Sorted este o denumire comercială a Accounted4Tax Ltd, înregistrată în Anglia și Țara Galilor, număr de companie 16438537. Sediul social: 128 City Road, London, EC1V 2NX.",
 "by": "de la Accounted4Tax",
 "other_lang": "English",
 "hub_title": "Scrisori de la HMRC și Companies House explicate în română – amenzi și contestații | Tax Letter Sorted",
 "hub_desc": "Ghiduri pe înțeles, în română, despre cele mai frecvente scrisori de la HMRC și Companies House: amenzi pentru depunere și plată târzie, amenzi Corporation Tax, scrisori „nudge” și cum faceți contestație.",
 "hub_h1": "Scrisori de la HMRC și Companies House explicate",
 "hub_lead": "Ghiduri pe înțeles despre scrisorile despre care suntem întrebați cel mai des: ce înseamnă, termenele și când puteți contesta. Sau încărcați scrisoarea dvs. pentru o explicație gratuită în română.",
 "guides": "Ghiduri",
 "also": "Mai explicăm și",
 "also_list": ["Notificare de depunere a declarației (notice to file)", "Calculul impozitului P800", "Simple Assessment (PA302)", "Situația contului Self Assessment",
              "Amendă TVA (VAT)", "Amendă PAYE", "Amendă CIS", "Scrisori Making Tax Digital", "Notificare de închidere a companiei (strike-off)"],
 "unsure": "Nu știți ce scrisoare aveți? Încărcați-o – vă spunem noi.",
}
