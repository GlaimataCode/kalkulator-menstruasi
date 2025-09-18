import React, { useState } from 'react';
import { format, addDays, addMonths, subMonths, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface DateInputProps {

	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput: React.FC<DateInputProps> = ({
	value, onChange
}) => (
	<div>
		<label className="block text-sm font-medium text-gray-700 mb-2">
			Tanggal Hari Pertama Haid Terakhir
		</label>
		<input
			type="date"
			value={value}
			onChange={onChange}
			className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
			placeholder="Pilih tanggal"
			title="Tanggal Hari Pertama Haid Terakhir"
		/>
	</div>
);

const MenstruationCalculator: React.FC = () => {
	const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
	const [cycleLength, setCycleLength] = useState<number>(28);
	const [results, setResults] = useState<any>(null);
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

	const calculateCycle = () => {
		if (!lastPeriodDate) return;

		const lastPeriod = new Date(lastPeriodDate);
		const nextPeriod = addDays(lastPeriod, cycleLength);
		const ovulationDate = addDays(lastPeriod, cycleLength - 14);
		const fertileStart = addDays(ovulationDate, -5);
		const fertileEnd = addDays(ovulationDate, 1);

		setResults({
			nextPeriod,
			ovulationDate,
			fertilePeriod: {
				start: fertileStart,
				end: fertileEnd
			},
			safePeriod: {
				start: addDays(nextPeriod, -10),
				end: addDays(nextPeriod, -1)
			}
		});
	};

	const generateCalendarDays = () => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(monthStart);
		const startDate = startOfWeek(monthStart, {
			weekStartsOn: 1
		});
		const endDate = endOfWeek(monthEnd, {
			weekStartsOn: 1
		});

		const days = eachDayOfInterval({
			start: startDate, end: endDate
		});

		return days.map(day => {
			const isCurrentMonth = isSameMonth(day, currentMonth);
			const isToday = isSameDay(day, new Date());

			let dayType = 'normal';
			if (results) {
				if (isSameDay(day, results.ovulationDate)) {
					dayType = 'ovulation';
				} else if (day >= results.fertilePeriod.start && day <= results.fertilePeriod.end) {
					dayType = 'fertile';
				} else if (day >= results.safePeriod.start && day <= results.safePeriod.end) {
					dayType = 'safe';
				} else if (isSameDay(day, results.nextPeriod)) {
					dayType = 'period';
				}
			}

			return {
				date: day,
				isCurrentMonth,
				isToday,
				type: dayType
			};
		});
	};

	const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
	const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

	const getDayClass = (type: string) => {
		switch (type) {
			case 'ovulation':
				return 'bg-red-500 text-white rounded-full';
			case 'fertile':
				return 'bg-pink-300 text-gray-800';
			case 'safe':
				return 'bg-green-200 text-gray-800';
			case 'period':
				return 'bg-blue-500 text-white rounded-full';
			default:
				return '';
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-4 space-y-8">
			<div className="space-y-4">
				<DateInput value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} />
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Panjang Siklus (hari)
					</label>
					<select
						value={cycleLength}
						onChange={(e) => setCycleLength(Number(e.target.value))}
						className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						aria-label="Panjang Siklus (hari)"
					>
						{
							Array.from({
								length: 15
							}, (_, i) => i + 21).map((days) => (
								<option key={days} value={days}>
									{days} hari
								</option>
							))
						}
					</select>
				</div>
				<button
					onClick={calculateCycle}
					disabled={!lastPeriodDate}
					className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					Hitung Siklus
				</button>
			</div>

			{/* Results Section */}
			{
				results && (
					<div className="space-y-6">
						<div className="grid md:grid-cols-3 gap-4">
							<div className="bg-red-50 p-4 rounded-lg">
								<h3 className="font-semibold text-red-700 mb-2">🩸 Menstruasi Berikutnya</h3>
								<p className="text-lg font-bold text-red-800">
									{format(results.nextPeriod, 'dd MMMM yyyy', {
										locale: id
									})}
								</p>
							</div>

							<div className="bg-yellow-50 p-4 rounded-lg">
								<h3 className="font-semibold text-yellow-700 mb-2">⭐ Ovulasi</h3>
								<p className="text-lg font-bold text-yellow-800">
									{format(results.ovulationDate, 'dd MMMM yyyy', {
										locale: id
									})}
								</p>
							</div>

							<div className="bg-green-50 p-4 rounded-lg">
								<h3 className="font-semibold text-green-700 mb-2">🔒 Masa Tidak Subur</h3>
								<p className="text-sm text-green-800">
									{format(results.safePeriod.start, 'dd MMM')} - {format(results.safePeriod.end, 'dd MMM yyyy')}
								</p>
							</div>
						</div>

						{/* Fertile Period */}
						<div className="bg-pink-100 p-4 rounded-lg">
							<h3 className="font-semibold text-pink-700 mb-2">💖 Masa Subur</h3>
							<p className="text-lg font-bold text-pink-800 mb-2">
								{format(results.fertilePeriod.start, 'dd MMMM yyyy', {
									locale: id
								})} - {format(results.fertilePeriod.end, 'dd MMMM yyyy', {
									locale: id
								})}
							</p>
							<p className="text-sm text-pink-600">
								Peluang kehamilan tertinggi pada periode ini
							</p>
						</div>

						{/* Calendar */}
						<div className="bg-white border rounded-xl p-4">
							<div className="flex items-center justify-between mb-4">
								<button
									onClick={prevMonth}
									className="p-2 hover:bg-gray-100 rounded"
								>
									←
								</button>
								<h3 className="text-xl font-semibold text-gray-800">
									{format(currentMonth, 'MMMM yyyy', {
										locale: id
									})}
								</h3>
								<button
									onClick={nextMonth}
									className="p-2 hover:bg-gray-100 rounded"
								>
									→
								</button>
							</div>

							<div className="grid grid-cols-7 gap-2 mb-2">
								{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
									<div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
										{day}
									</div>
								))}
							</div>

							<div className="grid grid-cols-7 gap-2">
								{generateCalendarDays().map((day, index) => (
									<div
										key={index}
										className={`p-2 text-center rounded-lg transition-all ${!day.isCurrentMonth ? 'text-gray-300' : ''
											} ${getDayClass(day.type)} ${day.isToday ? 'border-2 border-blue-500' : ''}`}
									>
										{format(day.date, 'd')}
									</div>
								))}
							</div>

							{/* Legend */}
							<div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-red-500 rounded-full"></div>
									<span className="text-sm">Ovulasi</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-pink-300 rounded"></div>
									<span className="text-sm">Masa Subur</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-green-200 rounded"></div>
									<span className="text-sm">Masa Tidak Subur</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-blue-500 rounded-full"></div>
									<span className="text-sm">Menstruasi</span>
								</div>
							</div>
						</div>

						{/* Educational Info */}
						<div className="bg-blue-50 p-4 rounded-lg">
							<h3 className="font-semibold text-blue-700 mb-3">📚 Informasi Penting</h3>
							<ul className="space-y-2 text-sm text-blue-800">
								<li>• Masa subur berlangsung 5-6 hari sekitar waktu ovulasi</li>
								<li>• Ovulasi terjadi sekitar 14 hari sebelum menstruasi berikutnya</li>
								<li>• Sperma dapat hidup hingga 5 hari dalam rahim</li>
								<li>• Sel telur hanya hidup 12-24 jam setelah ovulasi</li>
								<li>• Konsultasikan dengan dokter untuk informasi lebih akurat</li>
							</ul>
						</div>
					</div>
				)
			}
		</div >
	);
};

export default MenstruationCalculator;