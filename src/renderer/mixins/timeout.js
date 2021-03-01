export default {
	data: () => ({
		timeoutId: null,
		writingStopTimeout: 4000
	}),
	methods: {
		stopWriting(closure) {
			if (this.timeoutId !== null) {
				clearTimeout(this.timeoutId);
			}
			this.timeoutId = setTimeout(() => {
				this.timeoutId = null;
				closure();
			}, this.writingStopTimeout);
		}
	}
};
