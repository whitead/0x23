<template>
    <div class="card-container">
        <div class="canvas-card">
            <p>root canvas</p>
            <canvas ref="root-canvas"></canvas>
        </div>
        <div class="canvas-card" v-for="i in count" :key="i" ref="canvases">
            <p>canvas {{ i }}</p>
            <canvas></canvas>
        </div>
    </div>
</template>

<script>
import { debounce } from "lodash-es";
export default {
    name: "MolCanvas",
    props: {
        rootSmiles: String,
        smiles: Array,
        count: Number,
        ready: Boolean
    },
    data() {
        return {
            name: ""
        };
    },
    mounted: function () {

    },
    watch: {
        smiles: debounce(function () {
            this.updateSmiles(this.smiles);
        }, 500),
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
            if (this.ready && smiles.length > 0) {
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
        updateSmiles: function (smiles) {
            if (this.ready && smiles.length > 0) {
                smiles.map((s, i) => {
                    let mol = window.RDKit.get_mol(s);
                    const details = {
                        'backgroundColour': this.convertHexToRgb('#f5f4e9'),
                        'offsetx': 0,
                        'offsety': 0
                    };
                    let canvas = this.$refs.canvases[i].querySelector('canvas');
                    mol.draw_to_canvas_with_highlights(canvas, JSON.stringify(details));
                });
            }
        },
    }
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
