'use client'

import { MY_GOV_UZ_REGISTER_URL } from '@/data/milliy-sertifikat-types'

export default function MilliySertifikatBatafsil() {
	return (
		<section className="px-4 py-12 sm:py-16" aria-labelledby="batafsil-heading">
			<div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 dark:border-slate-700 dark:bg-slate-800/50 sm:p-8">
				<h2 id="batafsil-heading" className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
					Milliy sertifikat 2026: Imtihon jadvali, imtiyozlar va ro&apos;yxatdan o&apos;tish yo&apos;riqnomasi
				</h2>
				<div className="space-y-6 text-slate-700 dark:text-slate-300">
					<p className="leading-relaxed">
						Milliy sertifikat — bu nafaqat bilimingiz isboti, balki OTMga kirishda maksimal ball va o&apos;qituvchilar uchun yuqori maosh garovidir. Quyida 2026-yilgi imtihonlar haqida eng aniq va zarur ma&apos;lumotlarni jamladik.
					</p>

					<div>
						<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							1. Imtihon tartibi va bosqichlari
						</h3>
						<p className="mb-3 leading-relaxed">
							Milliy sertifikat imtihonlari yil davomida bir necha bosqichda (sikllarda) o&apos;tkaziladi. Jarayon quyidagi qat&apos;iy ketma-ketlikda amalga oshiriladi:
						</p>
						<ul className="list-inside list-disc space-y-1.5 pl-2">
							<li><strong>Ro&apos;yxatdan o&apos;tish:</strong> Talabgorlar belgilangan muddatda my.gov.uz portali orqali ariza topshiradilar.</li>
							<li><strong>To&apos;lov:</strong> Arizani tasdiqlash uchun bazaviy hisoblash miqdorining 90 foizi (2026-yil holatiga ko&apos;ra 556 200 so&apos;m) miqdorida to&apos;lov qilinadi.</li>
							<li><strong>Test topshirish:</strong> Talabgor ruxsatnomada ko&apos;rsatilgan sana va manzilda shaxsan ishtirok etadi.</li>
							<li><strong>Natijani olish:</strong> Imtihon javoblari my.gov.uz portali va Bilimni baholash agentligining rasmiy saytida e&apos;lon qilinadi.</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							2. 75 foizlik imtiyoz tizimi: Abituriyentlar uchun maksimal ball
						</h3>
						<p className="mb-3 leading-relaxed">
							Abituriyentlar uchun milliy sertifikat olishning eng asosiy maqsadi — kirish imtihonlaridan ozod bo&apos;lishdir. Bu tizim quyidagicha ishlaydi:
						</p>
						<ul className="list-inside list-disc space-y-1.5 pl-2">
							<li><strong>100 foizlik natija:</strong> Agar siz test sinovlarida maksimal ballning 75 foizi va undan yuqori natija ko&apos;rsatsangiz, OTMga kirish imtihonlarida ushbu fandan maksimal ball beriladi.</li>
							<li><strong>Testdan ozod bo&apos;lish:</strong> 75% va undan yuqori natija olganlar kirish imtihonida ushbu fandan test ishlamaydi (majburiy fanlar bundan mustasno).</li>
							<li><strong>Amal qilish muddati:</strong> Sertifikat berilgan kundan boshlab 3 yil davomida o&apos;z kuchini saqlab qoladi.</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							3. O&apos;qituvchilar uchun ustamalar: Maoshni oshirish yo&apos;li
						</h3>
						<p className="leading-relaxed">
							Pedagog kadrlar uchun milliy sertifikat — bu oylik maoshni qonuniy ravishda oshirish imkoniyatidir:
						</p>
						<ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
							<li><strong>20% dan 50% gacha ustama:</strong> Sertifikat darajasiga qarab, o&apos;qituvchilarning tarif stavkasiga har oylik ustamalar qo&apos;shiladi.</li>
							<li><strong>Sifat ko&apos;rsatkichi:</strong> Sertifikatga ega o&apos;qituvchilar attestatsiya jarayonlarida ham yuqori ballga ega bo&apos;ladilar.</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							4. my.gov.uz orqali ro&apos;yxatdan o&apos;tish (Qadamma-qadam)
						</h3>
						<p className="mb-3 leading-relaxed">
							Ro&apos;yxatdan o&apos;tish jarayonida xatolikka yo&apos;l qo&apos;ymaslik uchun ushbu yo&apos;riqnomaga amal qiling:
						</p>
						<ol className="list-inside list-decimal space-y-1.5 pl-2">
							<li><strong>Avtorizatsiya:</strong> my.gov.uz saytiga OneID tizimi orqali kiring.</li>
							<li><strong>Xizmatni tanlash:</strong> Qidiruv maydoniga &quot;Milliy sertifikat&quot; deb yozing va arizani to&apos;ldirishni boshlang.</li>
							<li><strong>Ma&apos;lumotlarni kiritish:</strong> Imtihon topshiradigan fanni, hududni va tilni tanlang.</li>
							<li><strong>To&apos;lov:</strong> Tizim tomonidan shakllangan invoys bo&apos;yicha to&apos;lovni (PayMe, Click yoki bank orqali) amalga oshiring.</li>
						</ol>
						<p className="mt-3 leading-relaxed">
							Ro&apos;yxatdan o&apos;tish: <a href={MY_GOV_UZ_REGISTER_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">{MY_GOV_UZ_REGISTER_URL}</a>
						</p>
					</div>

					<div>
						<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							5. Muhim eslatma
						</h3>
						<p className="leading-relaxed">
							Imtihon jadvalidagi sanalar talabgorlar soniga qarab davlat tomonidan o&apos;zgartirilishi mumkin. Shuning uchun saytimizdagi yangiliklarni kuzatib boring.
						</p>
					</div>

					<p className="leading-relaxed text-slate-600 dark:text-slate-400">
						Ushbu ma&apos;lumot foydali bo&apos;ldimi? Unda jadvalni va ushbu yo&apos;riqnomani yaqinlaringizga ham ulashing — pastdagi &quot;Ulashish&quot; tugmasini bosing!
					</p>
				</div>
			</div>
		</section>
	)
}
