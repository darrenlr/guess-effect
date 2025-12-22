import { useState, useEffect } from 'react';
import styles from "../styles/Modal.module.css";

const SettingsModal = ({ closeModal }) => {
	const [hudColor, setHudColor] = useState('#00ff41');

	useEffect(() => {const savedSettings = localStorage.getItem('USER_SETTINGS');
		if (savedSettings) {
			try {
				const settings = JSON.parse(savedSettings);
				if (settings.hud_colour) {
					setHudColor(settings.hud_colour);
					applyColorToDocument(settings.hud_colour);
				}
			} catch (e) {
				console.error('Error loading settings:', e);
			}
		}
	}, []);

	const applyColorToDocument = (color) => {
		document.documentElement.style.setProperty('--hud-color', color);
	};

	const handleColorChange = (e) => {
		const newColor = e.target.value;
		setHudColor(newColor);
		applyColorToDocument(newColor);

		// Save to localStorage
		const settings = {
			hud_colour: newColor
		};
		localStorage.setItem('USER_SETTINGS', JSON.stringify(settings));
	};

	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	const presetColors = [
		{ name: 'Matrix Green', value: '#00ff41' },
		{ name: 'Amber', value: '#ffb000' },
		{ name: 'Blue', value: '#00d4ff' },
		{ name: 'Purple', value: '#c77dff' },
		{ name: 'Red', value: '#ff4757' },
		{ name: 'Cyan', value: '#00fff9' },
	];

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
			<div className={styles.modal}>
				<div className={styles.terminalHeader}>C:\GAMES\SETTINGS.EXE</div>
				<div className={styles.modalContainer}>
					<div style={{ width: '100%' }}>
						<div style={{ marginBottom: '1.5rem' }}>
							<div style={{ color: '#fff', marginBottom: '1rem', fontSize: '14px' }}>
								&gt; HUD COLOR SETTINGS:
							</div>
							
							<div style={{ marginBottom: '1.5rem' }}>
								<label style={{ 
									display: 'flex', 
									alignItems: 'center', 
									gap: '1rem',
									fontSize: '14px',
									marginBottom: '0.5rem'
								}}>
									<span style={{ color: '#fff' }}>CURRENT:</span>
									<input 
										type="color" 
										value={hudColor}
										onChange={handleColorChange}
										style={{
											width: '60px',
											height: '40px',
											border: '2px solid #00ff41',
											background: '#000',
											cursor: 'pointer',
										}}
									/>
									<span style={{ fontFamily: 'monospace' }}>{hudColor.toUpperCase()}</span>
								</label>
							</div>

							<div style={{ color: '#fff', marginBottom: '0.75rem', fontSize: '12px' }}>
								PRESETS:
							</div>
							<div style={{ 
								display: 'grid', 
								gridTemplateColumns: 'repeat(3, 1fr)',
								gap: '0.5rem',
							}}>
								{presetColors.map((preset) => (
									<button
										key={preset.value}
										onClick={() => {
											setHudColor(preset.value);
											applyColorToDocument(preset.value);
											const settings = { hud_colour: preset.value };
											localStorage.setItem('USER_SETTINGS', JSON.stringify(settings));
										}}
										style={{
											background: preset.value,
											border: hudColor === preset.value ? '3px solid #fff' : '2px solid #333',
											padding: '1rem',
											cursor: 'pointer',
											fontFamily: 'Share Tech Mono, monospace',
											fontSize: '10px',
											color: '#000',
											fontWeight: 'bold',
											transition: 'all 0.2s',
										}}
									>
										{preset.name}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsModal;
