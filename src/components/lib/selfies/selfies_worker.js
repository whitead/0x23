import selfies from "./selfies";

importScripts('https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js');

const selfiesVersion = 2.0;
let pyodide = null;
// make fake function to start with
const selfiesMod = {
    decoder: s => { return null },
    encoder: s => { return null },
    pyodideLoaded: 'loading',
    selfiesLoaded: 'loading'
};

onmessage = (e) => {
    const data = e.data;
    const mtype = data[0];
    const mid = data[1];
    let result = '';
    if (mtype === 'loading-status') {
        result = { pyodide: selfiesMod.pyodideLoaded, selfies: selfiesMod.selfiesLoaded };
    } else if (mtype === 'encoder') {
        result = selfiesMod.encoder(data[2]);
    } else if (mtype === 'decoder') {
        result = selfiesMod.decoder(data[2]);
    } else if (mtype === 'vocab-size') {
        result = selfiesMod.vocabSize;
    }
    postMessage([mtype, mid, result]);
}


loadPyodide().then((pyodide) => {
    selfiesMod.pyodideLoaded = 'loaded';
    pyodide.loadPackage('micropip').then(() => {
        pyodide.runPythonAsync(`
            import micropip
            await micropip.install('selfies==${selfiesVersion}')
            import selfies as sf
            from selfies.utils.selfies_utils import split_selfies
            def get_basic_alphabet():
                a = sf.get_semantic_robust_alphabet().copy()
                # remove cations/anions except oxygen anion
                to_remove = []
                for ai in a:
                    if "+1" in ai:
                        to_remove.append(ai)
                    elif "-1" in ai:
                        to_remove.append(ai)
                # remove [P],[#P],[=P]
                to_remove.extend(["[P]", "[#P]", "[=P]"])
                to_remove.extend(["[B]", "[#B]", "[=B]"])

                a -= set(to_remove)
                a.add("[O-1]")
                a = list(sorted(a))
                symbol_to_idx = {s: i for i, s in enumerate(a)}
                return symbol_to_idx
            vocab_stoi = get_basic_alphabet()
            vocab_itos = {v: k for k, v in vocab_stoi.items()}
            vocab_size = len(vocab_stoi)
            def grow(s):
                # grow if new tokens are encountered
                for c in split_selfies(s):
                    if c not in vocab_stoi:
                        vocab_stoi[c] = len(vocab_stoi)
                        vocab_itos[vocab_stoi[c]] = c
            def encoder(s):
                s = sf.encoder(s)
                grow(s)
                return sf.selfies_to_encoding(s, vocab_stoi, enc_type='label')
            def decoder(s):
                s = sf.encoding_to_selfies(s, vocab_itos, enc_type='label')
                return sf.decoder(s)
        `, (err) => {
            selfiesMod.pyodideLoaded = 'failed';
            selfiesMod.selfiesLoaded = 'failed';
        }).then(() => {
            selfiesMod.selfiesLoaded = 'loaded'
            const vocabSize = pyodide.globals.get('vocab_size');
            selfiesMod.vocabSize = vocabSize;
            const decoder = pyodide.globals.get('decoder');
            selfiesMod.decoder = (selfies) => {
                try {
                    let result = decoder(selfies);
                    return result;
                } catch (e) {
                    console.log(e);
                    return null;
                }
            };
            const encoder = pyodide.globals.get('encoder');
            selfiesMod.encoder = (selfies) => {
                try {
                    let result = encoder(selfies).toJs();
                    return result;
                } catch (e) {
                    console.log(e);
                    return null;
                }
            };
        });
    }, (err) => {
        selfiesMod.selfiesLoaded = 'failed';
    })
});
