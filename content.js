chrome.runtime.onMessage.addListener((req, sender, res) => {
	main(req.ids).then(dms => {
		const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(dms))))
		window.open(`data:application/json;base64,${b64}`, '_blank')
	})
})

const NAME = 'DMDump'
const HAS_MORE = 'HAS_MORE'

const main = (ids) => {
	return Promise.all([get_auth_token(), get_csrf_token()])
		.then(tokens => get_all_dms(ids, ...tokens, ''))
}

const get_dms = (ids, auth_token, csrf_token, max_id) => {
	if(max_id != '') {
		max_id = `&max_id=${max_id}`
	}
	const url = `https://api.twitter.com/1.1/dm/conversation/${ids}.json?cards_platform=Web-12&dm_users=false&include_cards=1&include_groups=true&tweet_mode=extended&include_conversation_info=true${max_id}&context=FETCH_DM_CONVERSATION`
	const headers = new Headers({
		authorization: `Bearer ${auth_token}`,
		'x-csrf-token': csrf_token,
		'x-twitter-auth-type': 'OAuth2Session'
	})

	return fetch(url, { credentials: 'include', headers })
		.then(res => res.json())
}

const get_all_dms = async (ids, auth_token, csrf_token, max_id) => {
	let all_dms = null
	let has_more = true
	let i = 0

	while (has_more) {
		let dms = await get_dms(ids, auth_token, csrf_token, max_id)
		if(all_dms === null) {
			all_dms = dms.conversation_timeline
			all_dms.entries = []
		}
		all_dms.entries.push(...dms.conversation_timeline.entries)
		max_id = dms.conversation_timeline.min_entry_id
		has_more = dms.conversation_timeline.status === HAS_MORE

		console.log(NAME, all_dms.entries.length)
	}

	return all_dms
}

const get_auth_token = () => {
	return fetch(document.querySelector('script[src*=main]').src)
		.then(res => res.text())
		.then(js => /BEARER_TOKEN:"(.+?)"/g.exec(js)[1])
}

const get_csrf_token = () => new Promise((resolve, reject) => {
	const token = /ct0=([a-z0-9]+)/i.exec(document.cookie)

	if(token[1] === undefined) {
		return reject('csrf_token not found')
	}

	resolve(token[1])
})
