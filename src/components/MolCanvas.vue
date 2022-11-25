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
            my_names: []
        };
    },
    computed: {
        readyToPlot() {
            return this.ready && this.resultsCount > 5 * this.count;
        },
    },
    watch: {
        resultsCount: function () {
            if (this.readyToPlot && this.$refs.canvases)
                this.updateSmiles(this.smiles);
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
        tanimotoSimilarty: function (fp1_arr, fp2_arr) {
            let fp1_len = fp1_arr.length;
            let fp2_len = fp2_arr.length;
            let fp1_set = new Set(fp1_arr);
            let fp2_set = new Set(fp2_arr);
            let intersection = new Set([...fp1_set].filter(x => fp2_set.has(x)));
            let union = new Set([...fp1_set, ...fp2_set]);
            let intersection_len = intersection.size;
            let union_len = union.size;
            let tanimoto = intersection_len / union_len;
            return tanimoto;
        },
        updateSmiles: function (smiles) {
            // compute fingerprints first
            const root_fp = window.RDKit.get_mol(this.rootSmiles).get_pattern_fp_as_uint8array();
            const mols = []
            this.my_names = []
            for (let i = 0; i < smiles.length; i++) {
                let mol = window.RDKit.get_mol(smiles[i]);
                let fp = mol.get_pattern_fp_as_uint8array();
                // compute tanimoto similarity with root
                let tanimoto = this.tanimotoSimilarty(root_fp, fp);
                mols.push({ mol: mol, similarity: tanimoto, name: this.names[i] + ' (' + tanimoto.toFixed(2) + ')' });
            }
            // sort by similarity
            mols.sort((a, b) => (a.similarity < b.similarity) ? 1 : -1);
            this.drawSmiles(mols);

        },
        drawSmiles: function (mols) {
            this.my_names = []
            mols.slice(0, this.count).map((m, i) => {

                this.my_names.push(m.name)
                const details = {
                    'backgroundColour': this.convertHexToRgb('#f5f4e9'),
                    'offsetx': 0,
                    'offsety': 0,
                    'fixedScale': true
                };
                let canvas = this.$refs.canvases[i].querySelector('canvas');
                m.mol.draw_to_canvas_with_highlights(canvas, JSON.stringify(details));
                delete m.mol;
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
