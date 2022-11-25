<template>
  <div>
    <!-- <section class="hero is-primary is-bold" v-if="screen.width > 760"> -->
    <section class="is-primary is-bold">
      <div class="hero-body" style="padding: 0px">
        <div class="container">
          <div class="floating-hero">
            <span class="title">0xe4cc</span><br />
            <span class="subtitle"> v{{ version }} </span>
          </div>
        </div>
      </div>
    </section>
    <section>
    </section>
    <section>
      <div ref="inputcontainer" class="container">
        <div class="columns is-centered">
          <div class="column">
            <mol-input v-on:selfies-update="selfies = $event" v-on:smiles-update="smiles = $event"
              v-on:stoned-start="stoned" :ready="!stonedProgressing" v-on:selfieslib-ready="selfiesLib = $event">
            </mol-input>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="container is-fluid">
        <mol-canvas :count="24" :names="names" :ready="rdkitReady" :rootSmiles="smiles"
          v-on:selection-update="selectedIndex = $event" :smiles="mutatedSmiles" :resultsCount="stonedResults">
        </mol-canvas>
      </div>
    </section>
    <section>
      <div class="container">
        <div class="columns">
          <div class="block column">
            <p>
              (c) Koopman Operators Inc.,
              2022
            </p>
            <p>
              &nbsp;&nbsp;&nbsp;&nbsp;<a href="https://www.futureforecasts.io/">futureforecasts.io/</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import MolInput from "./MolInput";
import MolCanvas from "./MolCanvas.vue"
import pjson from "../../package.json";

export default {
  name: "App",
  components: {
    MolInput,
    MolCanvas
  },
  data() {
    return {
      selfies: "",
      smiles: "",
      selfiesLib: null,
      mutatedSmiles: [],
      names: [],
      viewWidth: 800,
      stonedCount: 1000,
      stonedResults: 0,
      stonedProgressing: false,
      selectedIndex: -1,
      version: pjson["version"],
      rdkitReady: false,
      vocabSize: 10
    };
  },
  mounted: function () {
    window
      .initRDKitModule()
      .then((RDKit) => {
        console.log("RDKit version: " + RDKit.version());
        window.RDKit = RDKit;
        this.rdkitReady = true
      })
      .catch(() => {
        console.log("RDKit failed to load");
      });
  },
  computed: {
    screen() {
      return screen;
    },
  },
  methods: {
    stoned: async function () {
      this.stonedProgressing = true;
      this.mutatedSmiles = [];
      this.names = [];
      stonedResults = 0;
      const results = new Set();
      results.add(this.selfies.join(''));
      if (this.selfiesLib) {
        this.vocabSize = await this.selfiesLib.vocabSize();
        for (let i = 0; i < this.stonedCount; i++) {
          s = this.selfies.map((s) => {
            if (1 / this.selfies.length < Math.random()) {
              return Math.floor(Math.random() * this.vocabSize);
            } else {
              return s;
            }
          });
          let n = s.join('')
          if (results.has(n))
            continue
          this.stonedResults += 1
          results.add(n)
          let j = this.names.length;
          this.names.push(n);
          await this.selfiesLib.decoder(s).then((smiles) => {
            this.mutatedSmiles.push(smiles);
            this.names[j] = smiles;
          });
        }
      }
      this.stonedProgressing = false;
    }
  }
};
</script>

<style lang="scss">
.floating-hero {
  padding: 0.75rem;
}

.column {
  margin: 1rem;
}

section {
  margin-bottom: 1.5em;
}

.tile {
  padding: 0.38rem;
}

.ref-footer {
  padding-right: 1.5rem;
  text-align: justify;

  @media screen and (min-width: 1024px) {
    position: absolute;
    margin-bottom: 1rem;
    bottom: 0rem;
  }

  @media screen and (max-width: 1023px) {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
}
</style>
