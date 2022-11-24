<template>
    <canvas ref="canvas" width="960" height="200"> </canvas>
</template>

<script>
import { debounce } from "lodash-es";
//import initRDKitModule from "@rdkit/rdkit";
export default {
    name: "MolCanvas",
    props: {
        smiles: String,
        viewWidth: Number,
        palette: {
            type: String,
            default: 'light'
        }
    },
    data() {
        return {
            ready: false,
        };
    },
    mounted: function () {
        window
            .initRDKitModule()
            .then((RDKit) => {
                console.log("RDKit version: " + RDKit.version());
                window.RDKit = RDKit;
                this.ready = true
            })
            .catch(() => {
                console.log("RDKit failed to load");
            });
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
        updateSmiles: function (s) {
            if (this.ready && s.length > 0) {
                let mol = window.RDKit.get_mol(s);
                const details = {
                    'backgroundColour': this.convertHexToRgb('#f5f4e9'),
                    'offsetx': 25,
                    'offsety': 25
                };
                mol.draw_to_canvas_with_highlights(this.$refs.canvas, JSON.stringify(details));
            }
        },
    }
}
</script>

<style lang="scss">

</style>
