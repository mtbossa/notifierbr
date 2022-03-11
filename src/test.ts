import axios, { AxiosRequestConfig } from 'axios';
import { inspect } from 'util';

(async () => {
	const test: AxiosRequestConfig = {
		method: 'post',
		url: 'https://www.nike.com.br/DataLayer/dataLayer',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
			Accept: '*/*',
			'Accept-Language': 'en-US,en;q=0.5',
			'Accept-Encoding': 'gzip, deflate, br',
			Referer:
				'https://www.nike.com.br/tenis-nike-sb-dunk-low-pro-unissex-153-169-229-284741',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
			Origin: 'https://www.nike.com.br',
			DNT: '1',
			Connection: 'keep-alive',
			Cookie:
				'name=value; _abck=6D30D21A437D6B0E6C662F154E09514E~0~YAAQT4xivrql22R/AQAAXj7KegeA6DTrjWecvv5+U2cUe/EQmZ7XbC604INWE/SoRS//cPXQWLxhzPMDi79hBlsL3QtfIrOLy34vlvZwagdNtL8nr99IKJWajj1FWX+05m3i0J3PidZ8+dO59LIS+Kd2xddjjaM/JcZQMky2VykUkWhWUl038drkbNFji/LFCXoV3jPNjhn7hLbwdE5UtXDawro9JegWxOfmUES+wpXYmV+TUPsJ5tHieYLXDbHH58tz0e5KSLQxCZuQ7WcJOv/Px8Hn4E7x7XhadjeRngkPrcRhDPCrRGqcSj7199HstYhA9K3wbCKB8rFmixvuPE/96PBSZVy6G1WSVdL7EdLrVeIZasFr7WW0Y8moqf5yksZNqSPhgmqVOULgJeXCwyA9kpV5H5tXUJg=~-1~-1~-1; AMCV_F0935E09512D2C270A490D4D%40AdobeOrg=-1124106680%7CMCIDTS%7C19063%7CMCMID%7C07162318941793771298601363492697853357%7CMCOPTOUT-1647039749s%7CNONE%7CvVersion%7C5.2.0; IFCSHOPSESSID=ta7nvovbva90g7ncdbpn97mt3g; CSRFtoken=5edd34d8065223af363910dc62870bb7; chaordic_browserId=0-zcGrnQ3J7YVTynP2aqRGnXRk_LGVZjHNkb8f16465024812672749; chaordic_anonymousUserId=anon-0-zcGrnQ3J7YVTynP2aqRGnXRk_LGVZjHNkb8f16465024812672749; chaordic_testGroup=%7B%22experiment%22%3Anull%2C%22group%22%3Anull%2C%22testCode%22%3Anull%2C%22code%22%3Anull%2C%22session%22%3Anull%7D; RKT=false; __pr.cvh=xtLBwiFDgS; bm_sz=452FD069F81FEAD01D1260968BC8EBAB~YAAQ3R/JF9Eo8Hh/AQAATp7Ceg8Ce7UyWwmniTkkpAIjZxg1jNqnlXRFwizuJntkLWvLsnRSGObuj56DcNSQ2+Rpc/LUG0k3VhOA2SkVn3pwwcG+vcI/11XNEaYmK6WXi+6mY6fMhOAPHA2PqYDgmwZ2anG8PT+BhrZaVeBFDuqS2NQAA9dbKPNkZotAHWYg0kPOf+lPUSas7SfuFpmXxKH02XoYL55JnuDne5h7XOh2UHJ9QgCtE3bMtd2SvtnNhDbb3dmMbSBqONy2dsHcHHjqAT6Pl6CB36uQnRMfCNg4Hvwv~4601144~3617076; ak_bmsc=677D5631C193636B95BF0AC659F243DF~000000000000000000000000000000~YAAQ3R/JF9Ao8Hh/AQAATp7Ceg91bfzihwn6fY2caYxdZ5BKDaxTWmQdwVgL0HU9bGRNaAk+AidB6ajg7CDcHJZuY2l1hUybWa0ukTERHtTICgDCOfdpY1uNBBDY+13npVgIaR52uSkPzaTIplM3KWAGRmN8AttOt6n7f0evZNXG4lsbaK00SLnS4M1CbQM6xrkyF+K71n+BOk9xHWZ/rS1jw+bpCpuPIpwXMzyRf/ratgHE5IE5PjBQxgYfaNtO1cH7Ig5dR+uZZXb8R3Q8C9iXOYDV8nUPSXzrh7OarwOFhmcl4PR/2lrMutXjSQESAHd7ErBXEO7vA830U7iPc/KfgqXxeDfROhAET2GS7/RVA2/RWIzDuFRAkIu3; AMCVS_F0935E09512D2C270A490D4D%40AdobeOrg=1; isLogged=false; chaordic_session=1647028434218-0.7007023007892693; bm_sv=148498C601E66227B410001DC39F2113~QvtJ5c+AXyPjehUM/NSv6iFcKtcKWFKJmMHecOAjQnA6rvfJaQxzcTuC6qmAXGhRoizjfKwJCr0RCT9l68grNdImxI8emA3hIphnrCaq52xmB4kHza3E8kZeZN9Nnj8fWD8BWmycx9yLsngSV7Kky1a+38emAF0UMcsYJUoFLE8=; name=value; SIZEBAY_SESSION_ID_V4=0EF4F8EC99F1c55283e3bf274e29bbdc66e4c2b4aa96; lx_sales_channel=1',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-origin',
			TE: 'trailers',
		},
	};

	const response = await axios(test);
	console.log(inspect(response
		));
	console.log(response.data);
})();
