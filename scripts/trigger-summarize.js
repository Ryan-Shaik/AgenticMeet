async function trigger() {
    try {
        const meetingId = process.argv[2] || 'meeting-aphhdel';
        const resp = await fetch('http://localhost:3000/api/meetings/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId: meetingId })
        });
        const data = await resp.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}
trigger();
