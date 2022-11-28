<template>
  <div>
    <!-- <h1 class="is-size-4 is-spaced bd-anchor-title"> <span v-if="selfiesStatus">Enter Molecule</span> <span
        v-else>Loading Parser (wait 5-10 seconds)</span></h1> -->
    <div class="field has-addons">
      <div class="control is-expanded" :class="{ 'is-loading': !selfiesStatus }">
        <input id="smiles-input" :readonly="(selfiesStatus ? null : true) || !allReady" aria-label="SMILES input"
          :class="{
            'input': true,
            'is-danger': parserError
          }" spellcheck="false" autocorrect="off" type="text" :placeholder="selfiesStatus ? 'SMILES' : loadingMessage"
          v-model="internalSMILES" autofocus @keyup.enter="startStoned" />
      </div>
      <div class="control">
        <a class="button is-info" :class="{ 'is-loading': !allReady }" @click="startStoned">
          {{ smiles_str.length > 0 ? 'Start' : 'Demo' }}
        </a>
        <a class="button is-primary" :class="{ 'is-loading': !allReady && selfies_str.length > 0 }"
          @click="repeatStoned">
          Repeat
        </a>
      </div>
    </div>
    <!-- <div class="field has-addons">
      <div class="control is-expanded" :class="{ 'is-loading': !selfiesStatus }">
        <input id="selfies-input" :readonly="selfiesStatus ? null : true" aria-label="SELFIES input" :class="{
          'input': true,
          'is-danger': parserError
        }" spellcheck="false" autocorrect="off" type="text" :placeholder="selfiesStatus ? 'SELFIES' : loadingMessage"
          v-model="internalSELFIES" autofocus @keyup.enter="updateSELFIES" />
      </div>
    </div> -->
    <!-- <p id="seq-link" v-if="selfies_str.length > 0" class="help is-pulled-right">
      Shareable Link:
      <a :href="url + '?s=' + selfies_str" target="_blank">{{
          url + '?s=' + selfies_str
      }}</a>
    </p> -->
  </div>
</template>

<script>
import selfies from './lib/selfies/selfies.js';
export default {
  name: "SequenceInput",
  props: {
    ready: false,
  },
  data() {
    return {
      smiles_str: "",
      selfies_str: "",
      loadingMessage: "Loading",
      edit_mode: "SMILES",
      view_mode: "SELFIES",
      url: window.location.href.split('?')[0],
      selfiesStatus: false,
      error: false,
      parserError: false,
      doStoned: false,
      doStonedRepeat: false
    };
  },
  mounted: function () {
    // convert pattern to list of integers
    selfies.startSelfiesWorker();
    this.checkSelfies();
  },
  computed: {
    internalSMILES: {
      get: function () {
        return this.smiles_str;
      },
      set: function (v) {
        v = v.trim();
        this.smiles_str = v
        if(v.length === 0) {
          this.selfies_str = ""
        }
        else {
          this.$emit("smiles-update", this.smiles_str);
          selfies.encoder(v).then(res => {
            if (res) {
              this.selfies_str = res;
              this.$emit("smiles-update", this.smiles_str);
              this.$emit("selfies-update", this.selfies_str);
              this.parserError = false;
              if (this.doStonedRepeat) {
                this.doStonedRepeat = false;
                this.$emit("stoned-repeat");
              }  else if (this.doStoned) {
                this.doStoned = false;
                this.$emit("stoned-start");
              }
            } else {
              this.parserError = true;
            }
          });
        }
      },
    },
    internalSELFIES: {
      get: function () {
        return this.selfies_str;
      },
      set: function (v) {
        v = v.trim();
        this.selfies_str = v
        selfies.decoder(v).then(res => {
          if (res) {
            this.smiles_str = res;
            this.$emit("smiles-update", this.smiles_str);
            this.$emit("selfies-update", this.selfies_str);
            this.parserError = false;
          } else {
              this.parserError = true;
            }
        });
      },
    },
    allReady: function () {
        return this.ready && this.selfiesStatus;
    },
},
methods: {
  startStoned: function () {
    this.doStoned = true;
    if (this.smiles_str.length == 0) {
      //demo
      this.internalSMILES = 'CCCCCc1cc(c2c(c1)OC([C@H]3[C@H]2C=C(CC3)C)(C)C)O'
    } else
      this.internalSMILES = this.smiles_str;
      // trigger update

  },
  repeatStoned: function () {
    this.doStonedRepeat = true
    // trigger update
    this.internalSMILES = this.smiles_str;
  },
  discardKeys: function (evt) {
    evt.preventDefault();
  },
  checkSelfies: async function () {
    const s = await selfies.selfiesLoadStatus();
    if (s.selfies === 'loaded') {
      this.selfiesStatus = true;
      this.$emit('selfieslib-ready', selfies);
      const queryParam = new URLSearchParams(window.location.search).get("s");
      if (queryParam) {
        // clean it up
        this.internalSELFIES = queryParam;
      }
    } else if (s.selfies === 'failed') {
      this.error = true;
      throw new Error('Selfies failed to load');
    } else {
      this.loadingMessage += '.';
      setTimeout(this.checkSelfies, 100);
    }
  }
},
};
</script>

<style lang="scss">
#sequence {}

#seq-link {
  max-height: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
