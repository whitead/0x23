<template>
    <div class="card-container">
        <div class="canvas-card">
            <p>{{ rootSmiles }}</p>
            <canvas ref="root-canvas"></canvas>
        </div>
        <template v-if="readyToPlot">
            <div class="canvas-card" v-for="i in count" :key="i" ref="canvases">
                <p v-if="this.my_names.length > i - 1">{{ this.my_names[i - 1] }}</p>
                <canvas></canvas>
            </div>
        </template>
        <template v-else>
            <div class="canvas-card" v-for="n in names" :key="n">
                <p>{{ n }}|</p>
            </div>
        </template>
    </div>
</template>

<script>
import { debounce } from "lodash-es";
export default {
    name: "MolCanvas",
    props: {
        rootSmiles: String,
        smiles: Array,
        ready: Boolean,
        names: Array,
        count: Number,
        resultsCount: Number,
    },
    data() {
        return {
            my_names: [],
            reportAt: new Set([10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000])
        };
    },
    computed: {
        readyToPlot() {
            return this.ready && this.smiles.length > 2 * this.count;
        },
    },
    watch: {
        resultsCount: function () {
            if (this.readyToPlot && this.$refs.canvases) {
                if (this.reportAt.has(this.resultsCount))
                    this.updateSmiles(this.smiles);
            }
        },
        rootSmiles: debounce(function () {
            this.updateRootSmiles(this.rootSmiles);
        }, 500),
    },
    methods: {
        convertHexToRgb: function (hex) {
            let r = parseInt(hex.slice(1, 3), 16) / 255;
            let g = parseInt(hex.slice(3, 5), 16) / 255;
            let b = parseInt(hex.slice(5, 7), 16) / 255;

            return [r, g, b];
        },
        updateRootSmiles: function (smiles) {
            if (smiles.length > 0) {
                let mol = window.RDKit.get_mol(smiles);
                const details = {
                    'backgroundColour': this.convertHexToRgb('#f5f4e9'),
                    'offsetx': 0,
                    'offsety': 0
                };
                let canvas = this.$refs['root-canvas'];
                mol.draw_to_canvas_with_highlights(canvas, JSON.stringify(details));
            }
        },
        tanimotoSimilarty: function (fp1, fp2) {
            fp1 = fp1.map(x => x > 0 ? 1 : 0);
            fp2 = fp2.map(x => x > 0 ? 1 : 0);
            let fp1sum = fp1.reduce((a, b) => a + b, 0);
            let fp2sum = fp2.reduce((a, b) => a + b, 0);
            let fp1fp2sum = fp1.map((x, i) => x * fp2[i]).reduce((a, b) => a + b, 0);
            return fp1fp2sum / (fp1sum + fp2sum - fp1fp2sum);
        },
        updateSmiles: function (smiles) {
            // compute fingerprints first
            const root_fp = window.RDKit.get_mol(this.rootSmiles).get_morgan_fp_as_uint8array();
            const mols = []
            this.my_names = []
            for (let i = 0; i < smiles.length; i++) {
                let mol = window.RDKit.get_mol(smiles[i]);
                let fp = mol.get_morgan_fp_as_uint8array();
                // compute tanimoto similarity with root
                let tanimoto = this.tanimotoSimilarty(root_fp, fp);
                mols.push({ mol: smiles[i], similarity: tanimoto, name: this.names[i] + ' (' + tanimoto.toFixed(2) + ')' });
                mol.delete();
            }
            // sort by similarity
            mols.sort((a, b) => (a.similarity < b.similarity) ? 1 : -1);
            this.drawSmiles(mols);

        },
        drawSmiles: function (mols) {
            this.my_names = []
            mols.slice(0, this.count).map((m, i) => {
                let mol = window.RDKit.get_mol(m.mol);
                this.my_names.push(m.name)
                const details = {
                    'backgroundColour': this.convertHexToRgb('#f5f4e9'),
                    'offsetx': 0,
                    'offsety': 0,
                    'fixedScale': false
                };
                let canvas = this.$refs.canvases[i].querySelector('canvas');
                mol.draw_to_canvas_with_highlights(canvas, JSON.stringify(details));
                mol.delete();
            });
        }
    },
}
</script>

<style lang="scss">
.canvas-card {
    //border: 1px solid #000;
    flex-wrap: wrap;
}

.card-container {
    display: flex;
    flex-wrap: wrap;
}
</style>
