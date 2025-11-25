(async function(){
    const dusty = String.fromCharCode(100,117,115,116,121);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    function genText(){
        let len = Math.floor(Math.random()*5)+6, r='';
        for(let i=0;i<len;i++) r+=chars.charAt(Math.floor(Math.random()*chars.length));
        let pos = Math.floor(Math.random()*3);
        if(pos===0) return dusty+r;
        if(pos===2) return r+dusty;
        let mid=Math.floor(r.length/2);
        return r.slice(0,mid)+dusty+r.slice(mid);
    }
    function encode(t){
        let o='';
        for(let i=0;i<t.length;i++){
            let v=(t.charCodeAt(i)+(i*3))%256;
            o+=v.toString(16).padStart(2,'0').toUpperCase();
        }
        return o;
    }
    function genCode(){return encode(genText());}

    async function hashKey(k){
        const e=new TextEncoder();
        const d=e.encode(k);
        const h=await crypto.subtle.digest('SHA-256',d);
        return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }

    const db = window.db;
    const validHashes = [
        '535a5188ed238d2d93400c69218031dae46e62440a64bc35e2021c2c9a95960a',
        '8653f63242671b7edc7862438effeb84e0c6b0f6fcb44188e0abd70cebf143bd',
        '51cd59e61198aa3d79a1680a3d13713de250c3af2ccf030f49236f96b39d5941'
        // ← add your real hashes here
    ];

    const url = new URLSearchParams(window.location.search);
    const key = url.get('access')||'';
    const msg = document.getElementById('message');
    const box = document.getElementById('code-container');
    const codeEl = document.getElementById('code');
    const btn = document.getElementById('copy-btn');

    if(!key){
        msg.textContent='Please access this page via the shortlink to claim your code.';
        return;
    }

    try{
        const hash = await hashKey(key);
        const usedRef = doc(db,'usedHashes',hash);           // ← fixed: just doc(...)
        const usedSnap = await getDoc(usedRef);              // ← fixed: just getDoc(...)
        const already = localStorage.getItem('c_'+hash);

        if(usedSnap.exists() || already){
            msg.textContent='This key has already been claimed.';
            codeEl.textContent='Your code: '+(already||'(claimed by someone else)');
            box.style.display='block';
            return;
        }

        if(validHashes.includes(hash)){
            const code = genCode();
            await setDoc(usedRef,{used:true});               // ← fixed: just setDoc(...)
            localStorage.setItem('c_'+hash,code);
            msg.textContent='Code claimed successfully!';
            codeEl.textContent='Your code: '+code;
            box.style.display='block';
        }else{
            msg.textContent='Invalid access key.';
        }
    }catch(e){
        msg.textContent='Error – check internet or try again later.';
        console.error(e);
    }

    btn.onclick = () => {
        navigator.clipboard.writeText(codeEl.textContent.replace('Your code: ',''))
            .then(()=>alert('Copied!')).catch(()=>alert('Copy failed'));
    };
})();
