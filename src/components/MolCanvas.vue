<template>
    <div class="card-container">
        <div v-for="(s, i) in smiles" :key="s">
            <div class="card">
                <canvas :id="'canvas' + i"></canvas>
            </div>
        </div>
    </div>
</template>

<script>
import { debounce } from "lodash-es";
export default {
    name: "MolCanvas",
    props: {
        smiles: Array,
        ready: Boolean
    },
    data() {
        return {
        };
    },
    mounted: function () {

    },
    watch: {
        smiles: debounce(function () {
            this.updateSmiles(this.smiles);
        }, 500)
    },
    methods: {
        convertHexToRgb: function (hex) {
            let r = parseInt(hex.slice(1, 3), 16) / 255;
            let g = parseInt(hex.slice(3, 5), 16) / 255;
            let b = parseInt(hex.slice(5, 7), 16) / 255;

            return [r, g, b];
        },
        updateSmiles: function (smiles) {
            if (!Array.isArray(smiles)) {
                smiles = [smiles];
            }
            if (this.ready && smiles.length > 0) {
                smiles.map((s, i) => {
                    let mol = window.RDKit.get_mol(s);
                    const details = {
                        'backgroundColour': this.convertHexToRgb('#f5f4e9'),
                        'offsetx': 0,
                        'offsety': 0
                    };
                    mol.draw_to_canvas_with_highlights(this.$refs['canvas' + i], JSON.stringify(details));
                });
            }
        },
    }
}
</script>

<style lang="scss">
.card {
    border: 1px solid #000;
}

.card-container {
    flex-wrap: wrap;
}
</style>
