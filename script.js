(async function(){
    var _0x5a3b=String.fromCharCode;
    var _0x1f2e=_0x5a3b(100,117)+_0x5a3b(115,116,121);
    var _0x4c7d='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    var _0x3e6f=function(){
        var _0x2b1c=Math.floor(Math.random()*5)+6;
        var _0x4a5d='';
        for(var _0x6h9i=0;_0x6h9i<_0x2b1c;_0x6h9i++){
            _0x4a5d+=_0x4c7d.charAt(Math.floor(Math.random()*_0x4c7d.length));
        }
        var _0x7j8k=Math.floor(Math.random()*3);
        var _0x9m0p;
        if(_0x7j8k===0){_0x9m0p=_0x1f2e+_0x4a5d;}
        else if(_0x7j8k===2){_0x9m0p=_0x4a5d+_0x1f2e;}
        else{
            var _0x8n7o=Math.floor(_0x4a5d.length/2);
            _0x9m0p=_0x4a5d.slice(0,_0x8n7o)+_0x1f2e+_0x4a5d.slice(_0x8n7o);
        }
        return _0x9m0p;
    };
    
    var _0x2d4e=function(_0x3f5g){
        var _0x4b6h='';
        for(var _0x5c7i=0;_0x5c7i<_0x3f5g.length;_0x5c7i++){
            var _0x6d8j=_0x3f5g.charCodeAt(_0x5c7i);
            var _0x7e9k=(_0x6d8j+(_0x5c7i*3))%256;
            var _0x8f0m=_0x7e9k.toString(16).padStart(2,'0').toUpperCase();
            _0x4b6h+=_0x8f0m;
        }
        return _0x4b6h;
    };
    
    var _0x1a2b=function(){
        return _0x2d4e(_0x3e6f());
    };
    
    async function _0xHashKey(key){
        const encoder=new TextEncoder();
        const data=encoder.encode(key);
        const hashBuffer=await crypto.subtle.digest('SHA-256',data);
        const hashArray=Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b=>b.toString(16).padStart(2,'0')).join('');
    }

    const db = window.db;   // ← comes from HTML module

    // ←←←←← ADD YOUR REAL HASHES HERE ←←←←←
    var validHashes=[
        '535a5188ed238d2d93400c69218031dae46e62440a64bc35e2021c2c9a95960a',
        '8653f63242671b7edc7862438effeb84e0c6b0f6fcb44188e0abd70cebf143bd',
        '51cd59e61198aa3d79a1680a3d13713de250c3af2ccf030f49236f96b39d5941'
    ];

    var params=new URLSearchParams(window.location.search);
    var inputKey=params.get('access')||'';
    var msg=document.getElementById('message');
    var box=document.getElementById('code-container');
    var codeEl=document.getElementById('code');
    var copyBtn=document.getElementById('copy-btn');

    if(!inputKey){
        msg.textContent='Please access this page via the shortlink to claim your code.';
        return;
    }

    try{
        const hash=await _0xHashKey(inputKey);

        // Check if already used globally (Firestore) or locally
        const usedRef = window.doc(db,'usedHashes',hash);
        const usedSnap = await window.getDoc(usedRef);
        const localClaim = localStorage.getItem('c_'+hash);

        if(usedSnap.exists() || localClaim){
            msg.textContent='This key has already been claimed.';
            codeEl.textContent='Your code: '+(localClaim||'(claimed by someone else)');
            box.style.display='block';
            return;
        }

        if(validHashes.includes(hash)){
            const code=_0x1a2b();
            await window.setDoc(usedRef,{used:true});
            localStorage.setItem('c_'+hash,code);
            msg.textContent='Code claimed successfully!';
            codeEl.textContent='Your code: '+code;
            box.style.display='block';
        }else{
            msg.textContent='Invalid access key.';
        }
    }catch(e){
        msg.textContent='Error – check internet connection.';
        console.error(e);
    }

    copyBtn.onclick=function(){
        const codeText=codeEl.textContent.replace('Your code: ','');
        navigator.clipboard.writeText(codeText).then(()=>alert('Copied!')).catch(()=>alert('Copy failed'));
    };
})();
