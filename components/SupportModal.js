import styles from "../styles/Modal.module.css";

const SupportModal = ({ closeModal }) => {

	const handleClickOutside = (event) => {
		if (event.target.className === styles.modalOverlay) {
			closeModal();
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={handleClickOutside}>
			<div className={styles.modal}>
				<div className={styles.modalContainer}>
					<h4>Support</h4>
					<div>Thank you so much for playing!</div>
					<div>If you&apos;ve enjoyed, please consider supporting, this will give you access to the game archives when they go live!</div>
					<a href='https://ko-fi.com/S6S7EDM09' target='_blank' rel='noreferrer noopener'>
						<img height='36' style={{border: '0px', height: '36px'}} src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' alt='Buy Me a Coffee at ko-fi.com' />
					</a>
				</div>
			</div>
		</div>
	);
};

export default SupportModal;
