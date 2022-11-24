<template>
    <canvas ref="canvas" width="960" height="200"> </canvas>
</template>

<script>
import { debounce } from "lodash-es";
import { RDKitLoader } from "@rdkit/rdkit";
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
            drawer: null,
            error: false,
        };
    },
    mounted: function () {
        // load rdkit
        new RDKitLoader().then(() => {
            this.renewDrawer();
        }).catch((err) => {
            console.log(err);
            this.error = true;
        });
    },
    watch: {
        smiles: debounce(function () {
            this.updateSmiles(this.smiles);
        }, 500),
        viewWidth: function () {
            this.$refs.canvas.width = this.viewWidth;
            this.renewDrawer();
        },
    },
    methods: {
        updateSmiles: function (s) {
            if (this.drawer && s.length > 0) {
                SmilesDrawer.parse(s, (tree) => {
                    this.drawer.draw(tree, this.$refs.canvas, this.palette);
                }, (err) => {
                    console.log(err);
                });
            }
        },
        renewDrawer: function () {
            // set to current width of canvas
            let mol = RDKitModule.get_mol(smiles);
            mol.draw_to_canvas(this.$refs.canvas, -1, -1);
        },
    }
}
</script>

<style lang="scss">

</style>
