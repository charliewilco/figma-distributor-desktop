<template lang="pug">
  #distributor
    modal(name='modal' ref='modal' draggable='#header' @opened='openModal' @closed='modalClosed' :pivotX='0' :pivotY='0' width='230' height='auto')
      #header
        #title Distribute layers
        #closeButton(ref='closeButton' @click='hide')
      #distributorBody
        #directionBlock
          .label Direction
          #directionPicker
            #horizontalButton(:class='{directionButton: true, buttonActive: direction === "horizontal"}' @click='direction="horizontal"') Horizontal
            #verticalButton(:class='{directionButton: true, buttonActive: direction === "vertical"}' @click='direction="vertical"') Vertical
        #spacingBlock
          .label Spacing
          input(class='distributorInput' ref='spacingInput' v-model='spacing' placeholder='Auto' @keydown='handleInputKeydown' @focus='$refs.spacingInput.select()')
      #distributorFooter
        button(id='distributeButton' :disabled='disabled' @click='distribute') Distribute
</template>

<script>
export default {
  data: () => ({
    modalOpened: false,
    direction: "horizontal",
    spacing: "",
    singleSelect: false,
    smallNudgeAmount: 1,
    bigNudgeAmount: 10
  }),
  computed: {
    disabled: function() {
      if (!isNaN(parseInt(this.spacing)) || this.spacing === "")
        return this.singleSelect;
      else return true;
    }
  },
  mounted() {
    this.$refs.modal.shift.left = window.innerWidth - 230 - 230;
    this.$refs.modal.shift.top = 80;
  },
  methods: {
    openModal() {
      this.$refs.modal.shift.left = window.innerWidth - 230 - 230;
      this.$refs.modal.shift.top = 80;
      this.modalOpened = true;
      this.$refs.spacingInput.focus();
      this.smallNudgeAmount = App._state.mirror.appModel.smallNudgeAmount;
      this.bigNudgeAmount = App._state.mirror.appModel.bigNudgeAmount;
    },
    modalClosed() {
      this.modalOpened = false;
    },
    toggleModal() {
      this.modalOpened ? this.hide() : this.show();
    },
    show() {
      this.$modal.show("modal");
    },
    hide() {
      this.$modal.hide("modal");
      if (document.querySelector("#findButton") !== null)
        document.querySelector("#findButton").style.backgroundColor = "";
    },
    distribute() {
      var spacing = this.spacing === "" ? "" : eval(this.spacing);
      var direction = this.direction;
      var selectedNodes = Object.keys(App._state.mirror.sceneGraphSelection);
      var boundsObj;
      if (spacing === "") {
        direction === "horizontal"
          ? App.triggerAction("distribute-horizontal-spacing")
          : App.triggerAction("distribute-vertical-spacing");
      } else {
        spacing = parseInt(spacing);
        if (direction === "horizontal") {
          App.triggerAction("pack-horizontal");
          boundsObj = App.sendMessage("getBoundsForNodes", {
            nodeIds: selectedNodes
          }).args;
          var boundsX = Object.keys(boundsObj).map(key => {
            return boundsObj[key].x;
          });
          var rightLayer = selectedNodes[boundsX.indexOf(Math.max(...boundsX))];
          App.sendMessage("clearSelection");
          App.sendMessage("addToSelection", { nodeIds: [rightLayer] });
          setTimeout(() => {
            var oldX = App._state.mirror.selectionProperties.x;
            App.updateSelectionProperties({
              x: oldX + spacing * (selectedNodes.length - 1)
            });
            App.sendMessage("clearSelection");
            App.sendMessage("addToSelection", { nodeIds: selectedNodes });
            App.triggerAction("distribute-horizontal-spacing");
          }, 20);
        } else {
          App.triggerAction("pack-vertical");
          boundsObj = App.sendMessage("getBoundsForNodes", {
            nodeIds: selectedNodes
          }).args;
          var boundsY = Object.keys(boundsObj).map(key => {
            return boundsObj[key].y;
          });
          var bottomLayer =
            selectedNodes[boundsY.indexOf(Math.max(...boundsY))];
          App.sendMessage("clearSelection");
          App.sendMessage("addToSelection", { nodeIds: [bottomLayer] });
          setTimeout(() => {
            var oldY = App._state.mirror.selectionProperties.y;
            App.updateSelectionProperties({
              y: oldY + spacing * (selectedNodes.length - 1)
            });
            App.sendMessage("clearSelection");
            App.sendMessage("addToSelection", { nodeIds: selectedNodes });
            App.triggerAction("distribute-vertical-spacing");
          }, 20);
        }
      }
      this.spacing = spacing;
      this.$refs.spacingInput.focus();
      this.$refs.spacingInput.select();
    },
    handleInputKeydown(e) {
      if (e.which === 13) this.distribute();
      if (e.which === 38 && !e.shiftKey && !isNaN(parseInt(this.spacing)))
        this.spacing = parseInt(this.spacing) + this.smallNudgeAmount;
      if (e.which === 40 && !e.shiftKey && !isNaN(parseInt(this.spacing)))
        this.spacing = parseInt(this.spacing) - this.smallNudgeAmount;
      if (e.which === 38 && e.shiftKey && !isNaN(parseInt(this.spacing)))
        this.spacing = parseInt(this.spacing) + this.bigNudgeAmount;
      if (e.which === 40 && e.shiftKey && !isNaN(parseInt(this.spacing)))
        this.spacing = parseInt(this.spacing) - this.bigNudgeAmount;
      if (e.which === 38 && !e.shiftKey && this.spacing === "")
        this.spacing = 0 + this.smallNudgeAmount;
      if (e.which === 40 && !e.shiftKey && this.spacing === "")
        this.spacing = 0 - this.smallNudgeAmount;
      if (e.which === 38 && e.shiftKey && this.spacing === "")
        this.spacing = 0 + this.bigNudgeAmount;
      if (e.which === 40 && e.shiftKey && this.spacing === "")
        this.spacing = 0 - this.bigNudgeAmount;
      if (e.metaKey && e.shiftKey && e.keyCode === 68) {
        e.preventDefault();
        if (
          !document
            .querySelector('[data-tooltip="distribute-horizontal-spacing"]')
            .className.includes("iconButtonDisabled")
        )
          this.toggleModal();
      }
    }
  }
};
</script>

<style>
@font-face {
  font-family: "FigmaIcons";
  src: url(data:font/woff;base64,d09GRk9UVE8AAEesAAkAAAAAg3gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAEAAAAQt4AAHREp3PUsU9TLzIAAAE4AAAARwAAAGBsZeneY21hcAAAAngAAAF8AAAHfOJG6U9oZWFkAAAA4AAAADMAAAA2Yielv2hoZWEAAAEUAAAAGgAAACQD6QykaG10eAAARuAAAADMAAADrKynAABtYXhwAAABMAAAAAYAAAAGAOtQAG5hbWUAAAGAAAAA9gAAAosO3F1mcG9zdAAAA/QAAAAMAAAAIAADAAB42mNgZGBgAOKtU/b+i+e3+crAzPwCKMJQo7qhAUb/f/n/Idcd5n9ALjMDE0gUAJVzDuoAeNpjYGRgYH7BAATcOxgggJEBFbwGADDRApwAAAAAUAAA6wAAeNpjYGZhZPzCwMrAwNTFtJuBgaEHQjPeZzBkZGJAAg0MDLzI/AggYHBgZGB8yfwCxGf+xyAPpBhBbMYvQJ4CEDIAAFRxDI8AeNqF0s9qwkAQx/HvmhhNopJQ8VgWKT2KXr31InjxVu9BRAImgeyj9O5T9B36Wt3EgQ5U2j2Ez2Znhl/+AEtzw3Bfhq3YkPTXbg2IeBYHPPEpDslZi4ekfIgjMk7ikZo5Vo6VE+VUeaI8VZ4pZypn3ucMMGHcp34XG+a+6u6Bn/oiDnjlSxyy5E08ZMFNHGFx4pGaOVaOlRPlVHmiPFWeKWcqZ97l3JWXqtifmtqxo+RCRcHev9uGGndo2qq4cvC7tj+5/tRbOXzQ5h/oYcsfHar+eG5d2dR2vdpw5OxvO9/QlVn/L6zY2O3vFNZ/rn+TfAMNnUh4AAB42u3U05KeAQCD4e/pbru1bdu2bdu2bdu2bdu2beMqtn97GTubTA4yOXxnEgSBICyUIIgfhEcMDtXXoRIRvP43IIYw4WKKJUJsccQVT3wJJJRIYkkklUxyKaSUSmpppJVOehlklElmWWSVTXY55JRLbnnklU9+BRRUSGFFFFVMcSWUVEppZZRVTnkVVFRJZVVUVU11NdRUS2111FVPfQ001EhjTTTVTHMttNRKa2201U57HXTUSWdddNVNdz301EtvffTVT38DDDTIYEMMNcxwI4w0ymhjjDXOeBNMNMlkU0w1zXQzzDTLbHPMNc98Cyy0yGJLLLXMciustMpqa6y1znobbLTJZltstc12O+y0y2577LXPfgccdMhhRxx1zHEnnHTKaWecdc55F1x0yWVXXHXNdTfcdMttd9x1z30PPPTIY0889cxzL7z0KkTujbfeee+Djz757Iuvvvnuh59++e1PZGSIdDTZKEo2UrSjmv9/c7SioP4Ci3zHIHjaY2BmwAsAAH0ABHjazb0HYFXF0jh+75XBVSA+1BVRUJAmFkjuvWkUaaEFAoGEXgMhQAKEAAKBUBIgJNkktNATOiG0UEMTFIiU0EUBERVBxS4q4p6bPRf/M+fcUALvPd/3vc/f32PuOTs7MzvbZme2YbWUsVqsVmvFVkMHD49oOzB2xOgOsaOGRwwj4Kvaixatik2r+pj2UhkxrDihSrk9UNVigaefwt+y31QU+BoT9LTlZ5vFailvqWqpY3nT4m1xWPwsgZZGliaW5paWljaWdpYOlk6WcEs3S09LH0t/y0BLlGWoZZgl1jLK8rZlvGWiZbIl0TLdMtOSZsmwzLbMsyywLLZkW5ZbVlnWWvIsGy35lm2WnZbdln2WA5aDlkLLUUuR5ZTlrOW85YLlY8sVy+eWa5avLN9Yvrf8ZPnFcsvyh8Vl0S1/Wm1WsDJrOauXtaL1WWsl6wvWqtZq1hrW2ta61jes9a12q681wNrQ+pa1mTXI2toabA2xhlrDrF2tPay9rf2sA6yDrEOsMdYR1jjrGOs46wTrJOtU6zRrsjXVmm6dZZ1rnW9dZF1qXWZdaV1jXWfdYN1s3WrdYd1l3Wvdb33Peth6xHrcetJ6xvqB9SPrJesn1s+sX1i/tN6wfmf90XrT+pv1tlWzKusdm9VWxva47UlbBds/bM/YnrNVtlWxvWx7xVbL9qrtdVs9m4/NafO3NbA1tjW1tbC1srW1tbd1tHW2dbF1t/Wy9bVF2CJtg23RtuG2kbbRtrG2eFuCbYotyTbDlmITtkzbHFuWbaFtiS3HtsK22pZrW2/bZNti224rsO2xvWN713bI9r7tmO2E7bTtnO1D20XbZduntqu267avbd/afug6aNToobEjqnnX87nXTqqZDaV0w7H7+tl9/e2+AXbfQLuft93Px+5nt/s57H5Ou5+v3c/P7udv9wuw+wXa/b3t/j52f7vd32H3d9r9fe3+fnZ/f7t/gN0/0B7gbQ/wsQfY7QEOe4DTHuBrD/CzB/jbAwLsAYH2QG97oI890G4PdNgDnfZAX3ugnz3Q3x4YYA8MdHh7O7x9HN52h7fD4e10ePs6vP0c3v4O7wCHd6DDx9vh4+PwsTt8HA4fp8PH1+Hj5/Dxd/gEOHyQnbfD7uOw2x12h8PudNh9HSQ9iohyBDqII5JhHP7ndDh8HQ4/h8Pf4QhwOAIdTm+H08fhtFOM0+lw+jqcfg6nv8MZ4HAGOny9Hb4+Dl87Efk6Hb6+Dl8/h6+/wzfA4Rvo8PN2+Pk4/OzEz8/p8PN1+Pk5/PwdfgEOv0CHv7fD38fhb6ek/J0Of1+Hv5/D39/hH+DwD3QEeDsCfBwBdpIiwOkI8HUE+DkC/B0BAY6AQEegtyPQxxFoRwEdgU5HoK8j0M8R6O8IDHAEBjq9vZ3ePk5vO8nu7XR6+zq9/Zze/k7vAKd3oNPH2+nj4/SxU7Z8nE4fX6ePn9PH3+kT4PTBcvd22n2cdjvl2O502n2dVM1Yl1hhmBIWPZavnQqDigPzjBlD6VHEQCclhhztVE70n6/T6ed0+judAU5noNPX2+nr4/S1UxFijK+v09fP6evv9A1w+gY6/bydfj5OPzuVLhL5+Tr9/Jx+/k6/AKdfoNPf2+nv4/S3U8EjP39fp7+f09/f6R/g9A90Bng7A3ycAXaqE0wqwNcZ4OcM8HcGBDgDAi0Wi1Vg186wZmL3nm2dg118njULu/kC60Ls6outS7C7Z1tzsMsvt67Abr/Kuhq7/lprLnb/POt6VAEbrZtQDeRbt6Aq2Gbdjupgp7UAVcJu6x5UC/us76BqOGB9F9XDQeshVBGF1vdRTRy1HkNVUWQ9gerilPU0qoyz1nOoNs5bP0TVccF6EdXHx9bLqEKuWD9FNfK59SqqkmvW66hOvrJ+jSrlG+u3qFa+t/6AquUn68+oXn6x/ooq5pb1d1Qzf1glqhqXtRjVjW51W+9Y/7RZUO3YbI+h6gFbWVQ/zPYEqqBytvKohrxsT6Eqqmh7GtXRszaOKqmS7XlUSy/YXkTVVNX2EqqnarbqqKJq2Gqimqptq4Oqqq7tNVRXb9jeRJVV3+aNastuc6Dq8rX5ofoKsAWiCmtoa4Rq7C1bE1RlzWzNUZ0F2VqiSmtta4NqLdjWDlVbiK0DqrdQWydUcWG2cFRzXW3dUNX1sPVEddfb1gdVXj9bf1R7A2wDUfUNskWh+htiG4oqMMY2DNXgCFssqsI42yhUh2MsP9AIVQZHpUzrYdv0xy6WGVTmNswoW6Ps4cc7P/4bm/PEi0+sfbL+k0XlBpb7qXxyhZe9pj41+Kl1T934x/J/3KhYtaJvRfl0wjNvPbPlmQvPdnr2Xd6QL3oOnnvxuY7PTX5ubSVeqX+lnBf4C7teuPlipxeTX/y+Sr2qr1W989LValCtU7XB1SZVy612tpqsXr76K9V7Vb/0SqNXYl/5sEZcjQU13q1przmiVlbtnNpXarvrvFynWZ2362yu89GrV+oOqPvtaxmv89c7vp76euEbdd7Y/+bj9Z6tt7x+3/oF3l29h3kv9NZ9avt0tD9lf9vxvKOlI9Xxq3O+b3XfeX7D/M74P+nv4z8i8OnA9g2rNTzRaGSjPxoHNh7feE9j+VbgWwlv7X1LNQlvcrNpjaaBTQ83vd1seLONzb5v/mrzwc3XNb/RokaLfi0+DOoctKXlMy0dLbu3TGy1oXWz1t+3qdymTZu0Nlfb+rQd3PbDdiParWl3uf1T7YPaT29f2N4d4hdyvMOgjl+FVg/tFZoXeq5TVKfPOnfq/G3YK2G9wxaGnQ/3Cg8Onx7+bhdLl+Zd1nUt37VD19nd2ncb1e1G9/DuM7vv7bGg19Le5Xsn9snoG9LvyX7e/b7v799/Y/+rETEDyg/oO/D5gdMimwx6atDcweFDkoZWHJox9PfoxOj3Yl6KmVac4FWccF5L4UImynB8EgWT5YW09LjciL17ALy/VU+/r6oJpvKEGqPGCJXHzgtAoi+WcK2r1hVafgB6V70rfNASKPwQUM82gBQgIEUSpv4wEJkW1yVR1ATVEZ8JmOoEoTrKjkJOYPgn8VMiFP8kIiAe+1wgeh5JhgKaQsoxQuYhep7ET4lQ/JMe0fUdMXx6/MzRYji7KiB9GWSsnJ+zdCnLXQPLly/JmbeUzcuelS2WMbFjysa4lWzUysEL+wjWV0RNiRvN4sZMihER7DukXJixYPY8ljErMzMjk82ZPWfWnAw2N3Nu+lzBNovs8WIwE9PTZqTOYGnJKTNSktmMqZMnjYtn4yZMjp8Wz5JVVZ6YlDxFTGIiYfaUrCQ2P2lR8lLB5ousjLmz2CxkPCuTZWXNXiiWMLE4eWFiFkuaP3l2gmDTxPTU6akMec+cmcywzFxJriSupwgQegpo9NZSQE85wUPw0w3gAny7APRjAlTF9lxVxPAJkPRqD64/RSmI+0/9qAkqMkEh95DuQlSmqwW2mYpwAoOqIrSntP4sBdGPukxQkQkKuYd0D+JVpewTe4o7crES3kbg27BSQHE5wVdhYCWMMUDiziscX3dBdzD+LjKCqsAWrRdfOhGysyF+KSRMgCrFnbQgjnxA7CF0EH2Rq/t3fvfbiHH/PoaL4legr6A0YA8mnYCcRNMOHZoKJvrATfHZZ+Im64NFV0VV4U1FyHFxkRF6nU8Df0GUvaCqyipcXCw6ftEI1hYNAkUdhqwkRVwUxzuIpmwvUtwM/KyOwVQ6lINrbyJoL+j06gNa1e1cRaj+sCkaZH8ZATEbYUM6V/1lMAwbCjJCBcP6zaD/pgVjg98PxE/uhz5U68WlINgmtBSZyeVLQpaRZYR8CXvDSwo/1UvYR14SqowqIxRC1UsIK4N4TERw6StkJVlJSF9E91X4qXwR3VeoSqqSUAhVvgirJAm6+RI/5f9rF1kWu1dZ8euhU1fZplHQ/E0FHdSzGP+sUHC8+Xds05q/Qxy5WZvNg6/WOqRQHvyr1SXYn0WvgY++k3Bcojz4J6HDR2+y6FF/izzDtA/41eBDtYQqi/CyXWr5B7M10fDdR8cl1tKzyOHZDhLe/IiNiv475OkTypekLklDBSO7C2mXdiG7M7E0DYGsYDZkTEifIFDDqljVEp9YwTCYPiGDzS74W6RzVeJLMpakl4in7EKheBPTElITWEEyZGSnZ4ts5IPiyRLx0iakstkRf0tbp8r0D+5SUpmHal0Npnp786MOdysTq/W7j6iG/w55bskbPDUhLUFMRHB3Ki8sNrZULElfkkFlMiEVSwfxYgWVFxYbE1iCGdlUln+DfHuxOhMyEtInIkJ3oe5WZzoCWUQypGaneapTongSqxODadmpLLmkOiP/o/TEAC7bC1lX1hWyPaK3V/ip2iN6e6HqqrpCIVS1R1hdSdC6WhjP33Mo75hgx8XBEfl92aa1EHGobX4zwZqJtkMiurBNcX+PJDKW5/c9FGtKsi5/DyUc0aXtEFOS/IhDJNrfIUlZ2Z73zY89JI4xcXzdwT35LG4TdIkY0lY0Y6JZfttDEWztpr9Fkg6yiKfNE/gwcevzq7cEw8+0eWlszk5IzEgUaJ+qZ0Qt7IzPMJGYjg/bOedvkszF06YJfJio8XmAKZmYl87mDIDENHxMyX4VEiWbn44P2znj75BMUu2tjYZDBfmnxQUmLgw53aWAxUXDniF5XUUHJjqO6NJ3CPsbJBmtLeXz0vER7Ja46i9qMDEtDR8qiIz5Ah/k8UytX7GcGFVlYioV3t8hmKzD5xnNigT7XNxiRqOaR23HaFSJiP1MrVp3Bcug9oaCyduuHbxJE8gbAfJF+QIMSx6RGDuJyR4bePVqBrQiWrMJsybOmpDJ5FN9efsQWD8CzpyBqVlT502Zy75szJVVWQn11m8wfdG0BUkL2BFlRXsa7V+E/nEbUrJTliYvYVnKh9erR+SbN8PidfPzZm9gqq2azi9dghF5oF5UL8CG2Xnz1y1mqscwfvsPA0pslszMnrk0hSmvPbyoCIbnQZs2gOlMWzSd2S/zL7+EEeshwB/mTpmHUrFO0soNsZG8WnXInIDSJ7Ak6cO//ZaIhw6FSbGJI5KHMa3uhxxJ/f1JqM8/B1XvDX43gBGytgrleWYoDwICIEJW5BhABP8AAkVEcIQixtXPiXMAjjxm2KQwa34fRxPym2+ExOFVlq3/jceIq1/fM+B+U5/MTBHKZW0hy8lyQtZGxNoKP1VtRK0tVDlVTiiEqtoIK4d4LM81B83iJ6ETmcVPwhH0RtbqMVw+ieFOoOh1BIrLilIQdVuvX4pO3XGl8M8DYMAACPgcdu6EAe5ulMmdAyjHA3aCq4yrzAOAnfq2BwjIscUH+faGOwnEuDf6GWS61/xLMKQXSC57k5eSAIrexQmg1RR/CXY/OXI2wMj5Luq/gbl3okj/T4i9XH9qwcO49DY8T8MBdf0J8hRhdTT8TJkJ7kMUzDSDHc1Y958mdghIH9MfCkXuZcg1DgX8RswyoIeaYUVwPdQMqzJmPIaNWtNCuVkTZczawXhiF+RaYrSSAWYr2YnO3iv9+DvvXBHv9GL7e4pGPXsy9QQiYKOXTyLGxk3iYMxGFr2pm4iOZupJjKL+Q1E6qFfMVjjAbIU7YY8K5vIJ+QR1JAM3JkZ03RjNNsW8JzZtZAZZnieqV8+Gotd+1nO/+GT/fqYVDOYGkwIwWEaAGqdC0OV+goQU6gkSmSYNLrjq8/qi2QXxDRPfXLj4jWDfiItNRX0m6jdtVl8wdz2B8U3N+Itm/AUzvhnFu+q5DQYXTQYXTAbNTAZN7zEw4y+a8RfM+GYU7+XaKStjszxDpb0e2lBlrIfN+npeklCDzm2aJGCfrmpEyqrQZEnnM+LTEnmEWs4Piz17xGEmDvfdEy5YmOjXV4QzEb67b6FgWoprJyfqSwnvtxENSuQqkfnT989cWsKILUowVB/MNz8gyCYBdWRDLg7v2XNYsEKx2+Tcr2+YYOGiL6XqVQU+lcdd+7njKyDHCb6ygwySLUHroP/JHQ740gFffQn2L0H7U+vAvyQsjHUgFmFXUa8JruXquUB2MOi5Wq7JxtVdz8UII2hEGCjKmCCTvbUfuXpNvQbyN/UbaPu0faBek6+BXlOviR2Heg2222bFHXjXgw1F166MptKg6z4YmTtQjBzJ4kaKgWvj2L7eoFfSK0Fc3MA6p9uwM21u7sjNZdpzWiXAqNyRO8TaXJabK3aMXMv67APZAbvWoWPiSpeDzB3t3syplE6DVgnxT7eBGUL/h/6cEKaN4bpgDuXqOXPQfgJ8voYRw3GopKFqEixebI6a2AF8fICa5n3jN7XYa2o3l9eouV7HANX9dYjYyTVfqiEn6PTWnObooZXj50RhoTjHxLmwwlaCtRJhYaIVE60Kw84hO4ynmUKfOk71GruOReVfR7ZFm6mtkP43r8vXmFO+prxvqlCEaSqTN0AHqFJTVRPHldfQ8LjYVJZhFyXIShfla4jyGuar6UUFRk5p4g0Jlfe/ZO5zEwX4j5m7OhT/g29U8aDGR2Mzs4Jjfa1xQS1Zj+6j2qa3YS37w6Sf1v9+6RL78UdZY5Us152d+wbUx+62HL9ljdU//sAuXVr/+6SfCDW9zai2PbqzoJa1xjnWs8+Qm4qPhk3I/ew3hjbI12K4/oUxAmpfGOMh5S9GW4uaI4cGQaFyQOaYI2WOGTRGyBwzeMSIpJZXobgCF+5l4F5G2noZuOjtvoA9Fcei8nCnPI1N5cF1wUQPKuRCk6DWE7P1oEuqYiwRCqv1oEkDTV5z0ah8HeR1szUofMsNchSnOU/dM+dpzH3qB3khBeVdXtp7Bu6GR+C+Z4h1P+7Bh8VSZnIl4qhr2L7/YrJUtPWLg/gD2ZIl2UD9v/5O+X+aEOV7lfYLH54FicNgfRLM3wA5J/gIDMZQMGsjjNvBzQ/ESYqBI9e4+WEC5S/6VSN+gxE/DI588UA8Uuch1xJq5L2+JIgp6M9pdfgukZ8vdjGxa0h+f8H6iyFDRH8m+ucP2YVdC229tWLFWBHHRNzYsXGCxYmxK8RaJtauWLEWm/Mp90D+IMmD7ISqyB8keZCdDHWN5t1ERIToxsSIRaOWT2Bp6WkC1czEoeMi3u7P3lTNuk6eLNgMMVVM28ymbxR7xW4m3hH7p21nE89GLhkuWKgI6dRSlWNx86gEcmZAanLKzNRklpKckoyvyZkEnpMKyYnJiTMTWaqA1GkwfdL0hOQpLF2kp6ULliJS0lME6+6RpHtBxLuCvScKCsS7TORNXjMumxEeyrV08/JdqwrYt7LZwUWLBZstFoh5Q9ncGNFH9GOil+g5L5Itbb09YYNgR0TRkXPyCZY7jep13BzInJM5K3MOy5idMStzNls0k6pteibMno9PFssQMGsxzFk0Z9HsBQzLAMsBYZlpmR5J3mPivYiCbjjsgp7HxdDY2CGCDRWx68RmJvLXrdssWL5YFyuGMBegShxCMflMbF63Lp9WLDBmKBNDYmOHmjo82ZXNj6pgWBhp2DZh6aDqK4DoMbAoEihC1ZcAMasherQZc0wi8naIWQXKG2NkeBoRIuQoRqDWC+RqpYA30uHjMJAjlB381TwY4QMfF4IcLnFEHI6wjzvD8BvgL+chCsIw7o00ILpAmQUjvib8AJVFHeMG+nPjx8H2SFi+HAZuB9cR1zi+fBlEbodx4wnsznEv464clwFyL0OFtCPSHDAKuUwVspfsJWQqtuFUhZ8qFTVyqlC9VC+hEKpSEdYL8dCy4CpGqOayuZAxiB4j8VPGYOOMEbK5ai4UQlWMwk/Eo7Irriof4+53BWh1XZH4444E/QlXDo8phJgw0Nu6c2BYuGFMDjuMQVeOoSWiXMs4GaAhomcPctlRF4gO+3sUoRmD0CKx/4A4zkh1iOM9D4SgQaJX5qJDjx4dUHDUGR1EDxNhFFrKB/YfR/kQelwc6ClCkJkx6S0fc0UZSko2NBURFopqgO9w0Crj6zCohqbOlhtICzUEUo7I0R1FQZNHRRzyThiWdfuS5SBesiTkWSAKLQ1Rp7Gj37dOhEM/en0VS2Hp5fSUf8tKdiwNQS38gEBChpZKyxUkT/EiAyXEREFx7luRQhShl3sQA5k8iEF19Kfrz/uXyjz96b6U3EnImT6kiUXI2AdLsJBjCCGgs1Jk+i7I3HXQlB+B7U0gCePJgacf37/0Rskc9CTjEfG+AvH0eO2o6xAX7UFlmtLiS2W6/+T0QRWSaRBQnn4q9uXuvgIGCnQxBjLh7gti4MaYHWjgI3SH2LhR7GDChdAdMRsHonrpe543Eu3aiUYmbqOT7T4xcT8RJ0+KT0zcT9qdbES4qDredodz+bx6HuTz8nnocQD69MFMBIAMEPR5oIcZoYzYHrC3D6gAYWDg54EDZoQiBoi6dy9mOACUv4A9e4mZMjlT7AHouxekPxWJP/TZQ8y8ipvJo7IrJ5cc/aGn5FNQsJPcdPmUegp2RpCHruhzQAREFOAnIsjABlx6SS9QXhgyYhEbg4HaH3xAAbnzJqMCYmAyGkAMTEYD0FB9gNFTxMiLYr1MbL2Zas8xNWRgpHOXEX6iGBEmqkciQpAByOgpQ5j7JHoKNOunJXyeQjTMYYGHD+XMwwf5DTBy9hAfL+JDP17FFaZpw3hODqoBrTJk50BOPH7qlekdPwF0+oyPhwk5+IkI8dmgNVK3ufxD3gb1h/wD1G31B8jb6rahYbfLPdjQ5G7DQJKZarfR0LprfbnabTTvFJD0gQ6g1pJmRRAQbZpS6HRpj6EHqNfE8CaaEwARfQ9RTTIQ5aS7iKqygSgrP4BISGoyIQk5GaLvJPCSTzOC8GqKRwCNVO4kGKDiBGJgQMn4dNc3oK76BJ24gy+cgqmqyjAaB8AKRnPB0h6zGoGyMixcaCjLozf5kdjTEz9AbfzIIaelaDuxUyxTr7aopd4QKgi1RNCv6g35agumXdFoHujuwNJb9MmKWMLk459ewszK15HN603kC+rxK6xgyd6sfQ8MSFTeoB3jqMaXiUWTxXhkfArE+MlTxgumlxMQLyYvpE0OEqHLFi3KEWwj5u1bEF+ePfelYNfFuVbCwUQ9CPmWiwP9dvcQrIfo10/0IJgMNXBpVsnYN/KofRaP3pPxP5BL5lMleYO4fk8yJxNvGnr5OyglnPKm7QQXq5Q9jZKpZvI9dUn20csi87JCXVJ9VDP1HpP4IzGgIRz/JKJIRMVqEFzZ1Ti1VL2qDqDgB4RaKl9VdjmOSfyRGJAIxz+JKBJRmd6F9p/UUDTZQ15djXTFJMpfg/4kk0/IGkhQU0hEQDwsAZfW5COuN9GamF4/9o9MHA2x7RsevjvQHQhe2o9aM8yAbtEs8MF57Abo2m8ZAoMHm15+SwRZNKvR2a7KX3lIr7di/THxPqj5pJ+QfTDxPtIfnz6YeB8h/VBhKoT6x77VK4TJXWoXtGsHapfcBfvlDszAa9R60SVl6nVBOkeg64oNjPSTfN10TBFBqNdNB19rxjWrbiXZdBJEI0FRKp2AuhUhLYMQqFswmtAwYDXllZ+7hvOorbB1G3WU5+m9dRB1pOfpHRUFivoUvhFHUU+Sb73BjS6lCN2INbDVW3owj0LqrWaPw/fWKLNH4jtqEKE+T2/EMUgfYvS8ia23kXf4oK2wbSsNRJXpfT+jexIhjnrekOh1bmAaoRKJ8OfOD0bO7gm07Z/yqVzCp/KDfJ7HH68qZbZqRa6TfOaCxLVx61jUttY7cWhnKll0xSpCk9TdCH4W8M1Z2Tjlp05sbcKq8cveZtnjFr89fwybv2rRyuzlbNnKVcvWLmE/vy8bZX7Thv1MmqsRCNFVvqZmIK+nResBUYNYXGxi3Myp6OBA/jhUceVg0YLF8xdnsaItn2RfSmNn0s5POjKYLSLl/AMkLklcNGkBG5bbaeMrglUXPWJGj2aTpyQnzZjKUpNFWloKi0E74+mdfPGU2Umzp7KMmSI1PcVQLch68oJJ8ydlsZAtjbKbCtYmrUVCpyFsCrH+HrKWLFi0aAHbkHtk423BfhfvxqwazbxQB2LH4OtHQF4eTRYNHw56Z60S15y6E44dBd1Xc0JoKGhO5eK6U/eFoxjw1Xyh41Gjsf2kreEaaEA+gP6m/gZob+pvwvYdoBOQtNE/EEMvqwPsGAjaG9qboL+hvQED0W4nIDX2ydrTHNHLQiRhGDwIg3joZY25grdIC54A0l9CK2dYcXo5M9gefS0zeMKMpKBX8VntXHEXLp9U10B7CYvsrBoLsoL6E9R5GY0/KhqDEoMX5VgDQ1aU16hhjJONXLFcrlQrQcvX8kE2Uo3A3dXdFR0JrS0GZSNEgyrabldfLuo2bPiqYHVFwyviJyZ+vnLlJ4Et4UpD8SrTzgojvq5gr96L/1mwn8x4vam+CVX7y/IxfF5GDUDbBdRjQr2MXqI585EPg+WrPPJim/cb5LKvthV9KX77Z1sJahY5vhrEFI+opyqQFhTVoEoZ9JDEbdTtNeth1p/byb7afqI0i5eFeuw+FpGsQVzrzoOassGqHffIQDKWQRlfKi0jlrKrtjaNi37JQxJGs0lvj57Yh5YN4X2xffmqrWzF5jl7xR4WIaCGqs57i9FLJ69kCauT88VuAoq+s/usGMpWRW0fdwTJdkINWR0LpClQnGoKBWTaiFIQdVkd50aNF5j1H2GI8cLfLYacaM6VFphTpRHUdK5rx9CMaSCC24qGTDQ4FfypYAfFO3lrdrNFK+euSlvH0nOnr8bER+3qtb4rFn6oqs3Fb1dpBf6cOB61MYwtGTl/qIhmIjpxaMJIFhPWYVArwWoI/6viFpNS1kbubU3up4n7IZP7lrFAqC3vonqYfiCORW0KY4PHAqXYBX1nFNKV5urOu2EWDmAXxxYi38Uuru4UGHsZI8wljAZGViNMt6fAXIKJhLFoEfqqTJrZoLkMQnl/3z4stPfFvt6iMxNtG/fpM5TJWuaiSDy+NsDujXs27NjC1q3JyhZLmdgcu47mP9DR6y8T+Y+fFNFO2BewSSaq7rKLoTiThequughF68UvFKnyPzZicqNKpAnGRPh/Qok6aoWrGdq8I3PFJiY25eZuEmyTyB1pVNXIkdE00Tb9fxXvVaXcHtdKLRUthfrqaXy8Uar6Qj0tnxayPsrqLfFT1sc+6C0kIqAhxtA8NPCfQXyMQZrS+MgFaUrjP/0X8Ul9n9Fmc/djWgUI3wSLQkDWdQ+GxcGwpRBkY5pF2nUZTmRD2GbQv5f7ubZAoU+eGAxTUyE5CdRLKhJ9Ie2GMVac0DryKQvTls1fxBYsyslYlMQ2jobV8di2wkEsmr9gkWCLxfypYjKWVjlYTY2uAYjFC+ZjxCKxIJG28mLTNCJqEMXdCKKoYUScR/iCBSbc5NQZRNsuXYMFGy0gSkRnv73WmOJMS2eqnCwDv6tKPDUDjO+3l6duXraK5azcNGvVBJYzCdOpBZ550ywxL3XuTCbmgMhdSYAVInvy3PFs7uyszPmC5XqmVYfB3NnzMrI886wjzfQbtWvX2Ei/n4hcFreByvVH6c+/kFVh8WqYshrGvDP1HVGItdBF+uCDPRX/pI/yEaoLsuii8BObJ+ssei7stYpNngsJqaDiRoIc9zY/GHcs4QRSxAnZWrYWEqWQcQo/VRzWcZxQrVVroRAasjh0TTf2CmqwoeFwEutukbHfSDZ0RXFU6iCwTukVBq4cUQriztFT/i2SGqVJVJSPAU2BqccgjMySnFIQPcWV82+RsOa50A4aiwVCPwg6vgvRCChZOC5ZWKau2UfbwQ2jPaI/aKR0ZAxoHbUO5GajQ13nJrnT6GQrWs3bhWP7ZXkZTgWD/oL+AiI/Z9jUXJ6VZzH1s2gqeLb3unbyk6oXLBgCW1FLDkpHgxhd+RFjCXJK9QTVCH384SsIohpjzCnZExbkw4gViEiTE4PSiBAhJ2Uvmp9tz9WGdPATcK4HyLeVP/iqHBjZAM4dwKAMJFggxY38FHxlDsH84YMDgMOL2pBmgOI+g7hAgwwFvLiF00oQGV53KtypQDOyJLYsDvIs7F2DcCqMaeA+7D5MaK7DrsOgphnzkEYOEfXRU7KP9qW1ynro/Q7zv521xUQKMY1iz4KUsTBVXB4Oh3NzyereElaJOHoK4tHErZ6CiHpd9wV+b46XZnypvYa5vuLa49XR1oZ0rBlL7Cd1hWJMxKaMSRrFEmNg9Wi4VcNcuq/5G4xeDdGJEJc0ZuYIlLmCqHNttAQmMiAtA2pJCXKtWgPJU1OmkLroszVqr2B7xdatYi8Te6O2oikxWUxJmZrM1Fq5FrTd7hVcdpfdQdVAJZSVN2ej2IjZf6WuLK8qbWZ6jnwVZC09E9apl+U/XpF1SNNvmrN+PpOvqFeMjHL5ItdOa2egYKc4HVHAml2AATvbiAEDmH5aPw1hahPIjdipFrrKcb2V3hKiVAeQHbaC1kprBaouprB1G6d9V3D9OqxYLjaPXc6aXYSxy6PF2HHMaSzbuvahLXJJFBWJj5m4FFLURLDWIqz35HZsODaoxUINVoOFWszEcGg3uXeYaM1Ek6KQS4J9TDSXmDjbu7DdIibWw32nQtYLWNSusPdZwT6XL3PRJ2oQFk8fMWibUVjbtppFFyX6MF3qGiIMijIQoszS3LrNQNg2CBGoINLyuD5Mw95q/MToMaDTj3D9zrUqelVwr0WLo6pW9b81tU6N0aANR1VlsjAaImIdNhcFS5qoXK+TJrtuqqRpoEVoESVdp1Tv0iN0NJSmmQrwutlCGxZX4GEmloGNrgUtP8pRYdxIGMWRo8yEZcPCu/1VeXAPh3HpQVMetHC98sNo4Q+h6SmHH0IrfBiN2kewFsqxrk9QXX8cUvSWYE1ESIh4i9pBe2wHV40a/ucVKBtINy9Zay72lFt4uLEy3QI78HhtPKaHiQptkVHMtESEZdoOs44iaK/pdcHNjPIqxKqlUaSBOeQXmiaohgYmbaQnzUZbnFHxR5g4YWbNI445VNxdJyYw5hV1BgpQFxMQWl3QQiO5wG+9Li0YIcBYDJKjzNY0yuCBrEqGFCOFQrOocOShpWf9PZrramgOdQ0NAYReGuK6IEpB1AY1ilN7LTQbpDn4XSgFopX7ByGowysYwqkNZgY3oDRhRglt8DDGbK6ax5VbuclPlm7pJvf6kWvhnqXuB7YAHNTf43fX1aldbDBTo0y7lqkNputHrXODmb7RgPSUv7qfQF2T1/iDi/cp/8FehP/dgr63K4hfFx98IK4xca3lB07BfEXLlsKXCd8PWl5DU7yIdxcR5npuQYG5zmysOneLiOgmmCsohF+7R+77CPJu98jfK00u3En3kZ83yYPuIz9hkr9bmry7Qe4Oan9X+Ov3hHfeR979Hvm7pcm1ja6DXH9aQEZixlTacTs1NTE1kWkISZ2fNl8soG3TCzJwMGqvn8BSfBowOm2qYIicPjWDpetPw/yM+RkL6JzcgtT5qUw/gYaLh34BbS5ekI7RzEhjakaimMpEYiqmwlR7DTneo19g0lMaU800EDk9McNYwK0gN3Bj7A8zNXAhtbKHIOtNSLgJIaMl0LXTNY8baxHqBTCWJuQLcEa9wE+bn8oTdUZAG3n9L2Kq5XrUf53pf5J82/865v+NnP8HxURTErL9DS53boRlGZCdCKeGnI6/nM5kskA7q5uQyWheJaOn3h29dMNT70ZnXpJZWttFYWvC2JJoeHs4oEfbCOS+4Vz9FAl+SfDuOZC+6AiMLJp4TnzI/u0Siq8IXBm0nb2j+fLdu+G3miDHy/Gwux+oNWgdqjqyjrnH1bWMh5uK2tD14aauL7E2GppBjy2CQa2Huy/fvh3QtE6FQyc3fSa+Qll6Kz/pi0Y3U72F8qXd971Rll4I85O9BftKfLbp5CE0whU6eS20pWhzN1JV8WmEFI2FqiqrCtkI+TSW+CnRtZSNhEQEoRobvYuf/HvT1FPW8Xt2mF7ZqNWz8rirDUer0Ri3Fb3RhtIi5HEuJ9KwNx8UvV3zwT3/zhMcKTD0FlRBrxfEx+DlwrgkbhytVR3BDZ7NxxXVKXMCUIWaM4ASx2xv7aixoH8nwZgcph3ZrkMy9BH0KlRmlkKVoW7wsOzoYdmR6IXrkIc81EOOKWXq5R5KXhuKyReZPEM8yVMBTHTNfyivaNWYMCqUiWahuNvIiQ/nv0rZpvIgbSo/6NlrftCz//xH1dsE6j+aQO1HuPO8yuRIQadmoYqLoDcxD7lyuyuXS1pW1c+BMtaA8b1dRvPzJtcgk6mrr+AfmpAWd3Pgoul7bAlrwB1DOV0DLnzLtZqFC28U9HEE3gDEI8LqD8GowwyTv/Lxy0F1k90A26Sso+qgCAmGtaNj0VPHIvuuq+pG24pUpprGDYMh3DTqsCs1kA057WWkWYgLxshAozzTcviSJWheo4WL7yXI6xoavfgePgImLQb1ofwQ1PvqfZDGzxvyDcLLGw4Jk5An9tiEBEhYYpgq9Jafj+XnWtMCSI1bFEbcW7dg/XBo1Rp+wEwbM9/mRHmr2PZ9+rIRebBt26r3xBHsFI/X+xYzzl4Xnh3tKf/RiXkvLeX9U1xeR2f+PSyC6+jMdzNcYlcs2Z0/q4lYZANA0oc6rhxoLp4HmaQcoOhHuyAd/1F6g2gWcJ4aiM88RJ8n1EA5UMh5iD5P4qdEKP5JREA89j9ahS6U3FWJa6/L1aC9rlaDbv4YQeniWow6Ayf7Q7v+6PLhpz5MnoF2u+DkLnQG8VOP1n/iH+6BU/0gqC9or9JqTD10v9u8Ayd2wZleUNQX2kcgmTqLDJAgeBecLjCPYVTg2FKMkwSFxhEPOYrMcDTlDd2sHTSUM1qTCKtsWvtaZcNzKMlooUkdVkJ9jQtXlEntjvJQy8cMA9og11PukhO4FDntoNU8iev3Ja55EtfvJi4fw95eaHbCMI9qItmNSTBssDQJRoMKGr3c0LXktVQ2PSBzAqU0ubqG5K4ok9xwhGmIeozoUzz0KXfpiysgfZhJX+ihp+R1T/LafcnrnuS1e8k/QnpMuRRED0XnwnQmQk0Xy5zEe7jghOkT3l+UG2j6iVzHUNNrIY/NS+sl18o+nJY4b9WAnPh1IieH5eSIvPhspoJlMJ3yj4kBFayCYcIEMSI7nuXE5xESdm+hf0/dPT5nhIiPZxPiMXoCk4S6MQY2bgRJDHKykVkOi8+JJaQaNVAzskVaiFaTV4FaaBXFq3iIjBTttkey7ZEnxPbtTKup1YTz5yHoPOj0Gbm9vYiMZB4kSQRViq9gjuJlPGpFcTJyO/PgGBOZQUFwPsjck+Dh6EFSROCFNnAT1wCutsh8UFtUPjRuHFlD1GGizvbqlxuzy41/HfibYL+JX3dcvswuX95+W9xk4mbkrcaXmX5FHeTi5oYT77/P5BA5DOQQFQvvh23ogPT6j2Yz3IOqlTaqlmxvNTexlmxvHcqM5bD/RfzdCzW2m5vy5B567zH20Altu2f2NYmrPY+Il3twkKCtTYjkS0iDHoU0iLb5BXyuMs29ttW0X7gYCyswagUtY6m+shmXHXEIX7+eLIKOMGIEyNGqGbav2uYyX21a5hu7gqva5kpYbfPAT+RYYjTWYITsJDFSxGg4eqbEiM4MlTAqMBkhvxUruDQZKZORilTx3ORh8lN9FYmE1gSOOSoULREcYORoZO9h4WE4diz3sPAwlJEruJkrM4eSGClihGOZJEZ5eSiSh1GByYhEGss9mfJkkQqqnjaKrxgGg0dDv1MwbSHMWwi7T8GW0TAWm0obTH0DbFkNu4Nh3hSYNgX6BcPg1bBiAyiMU3XlEa4qUd8+AZLe2glQlXbx/qQ4q4EcTr26GqjmAlzj+/9VVBKrtWv1X0XXqvxlzno/9cs/zy0taaD5jy9X3m7+TzNOaLsNbGrWfq6ZOKzMBfULpTwXJL313cbBJ+1T0J0U/BTInyb0mfITrs+lKvkFNHqrX0Dfjb1nKGifmidwdHqjV+1V7JKRLuC0xcHYrIpK1VCOsqLHDs2j0ZcGYpqbIjQa1BuhAa8GGju/jCNp2hVueiwNPD5KAzKqHoJpV3QnN7ycBp5Bg940d1UKRrXTFxX/VVMif4+Jul3vy4W/qcivGnKqIPkdP4qGdDd3Nwg9Cq5urm5w1N2NhxKMvgmGcTQS9af5HxxazBuRRgu1HjP1vFkn2vO0wiNbyOZo1jJzAHrs7gHMtRj0Rm1P2QkGOtWIVkNxdW9ugG6AgaDWmjHB4D7qPsrpw9sEG9E3DHrXUWHE3DBjlBkjgw3n5parPqbWxjxLecY8SilEaYBe87+AIitLNEDagsQWvKTTexFFgl0Qx44ap9A7Hm0mWIjoFpHQiSmM12pGcxE1fHiUYIPF8PViKxNb16/fIthWsX64iMLRZdN/i5U7DuNPg0JNMulI14IQwZqLjqHGXQbHQj8SrEgcLFh8hMkImjfY9C9ZyeX/NVam+R2MFXdCzZaz1QnB9GBzC7eGbzlDyO40ezAD21Owub1BCzYNv2PYtk8iyWx5EptVW0/PwrexOYBuTUlmQmtrdj69rcfSN6gUUt1NSt6X1D0qeY9KmPJJlO9uUuq+pO7Jp0rkqwK+Vcoc1O5w9bX8ChRT2LlnqdlwJ83stsX4VnPUHJC05qU9rj1Op78HFNBO6aH5Br18EsnlV0guiVwRebGHnNhIIjeWzHQiD/jc2DW9E/KR3JWktaJtu+4MkJ1lZ/gKPY+NagOEtIdhG8jAGrUGk5dz4OvrNOJ0Qk2RYeQYKbe56nC5QW6EoiLYMAw2DoM1cWZiPk4aehEZ2ZoHj/HdWXUGx5eGWqntiuWbxoI8piJg3XgYMQHUMdUaYsZjmfSHgsZY8kUg02VNUOkyEAp1yeUcISOwncg56MvMUfip5qBjMkeoCGxdCqEoJn4innHlCvkxdz2lEvV53zVs+EeODvk86I4XYY235nQu79OpJ9staMConlUgqkvakThYRUHOeIhHD44+oxBEUdQmpjZo167BVOR23tSIxR7V3RXutBa8+GnzsJ99Squ3RD0m6p1766spjCB3KKb4aSh+U7+E3vnRo+IjJj4KPdqCekhoqGjORPOj1EO8qjy+tHiAVoZniXnpWRns2MI9B8VJJk72PdhxIUvKmJaeJFiSSEpLSmUdp/TtKtox0W5P12NTWFZqVloWFkY3/ov4/DPxKxO/BnxWW7BaIiBQ1GKi1ueBv2Ib/VVbxQ03wAlJGciIuE0TSbQ87AR/1ZUrkEB7QSUogPlLFi1cvIC1UF5c0YjXDSS+0uZhSllMZKVnpc9j+aoKEiEybU4l4kkLJi9KXMxkhRackjGcDUwt9V5qGUxWzeeYQlna1GqkOHXSlMmTEtmHsgKXDqR4DxS+0hFZJDH6SZvGhsgq3EiB9qlSiounLpy8YBKr4uotv/aU/nnIykC5jG0eaVk0a/24WVUloyyGk1KnpZnFmI6iGJXpqR8vTX2MjuPIXBg5EnLx/1xaqp3E9Qh9ABzqAtoALQLCD9NS4SKuEfAwBgjYpYthcWe6upvbyQaY28l2Urc0fbQI00UrIBfMXNqLMFf2DG9XrtQmc+kn/Yx7KlqqIJrVoLkQ2umch7YtRcnPZBiXFIkxGG+cgKaj8RRpYOQZ90QUV3elcX24PgzGj4Nxy007myZtJqoJoHXXupcc8ArQ3uKqqoDhfnSrm6woPzG2SFRUn0A/AcO+APUPrCccrMPlmxCm3gSHmsMNg2aAac/spNvySkHQZpiCevEcFSBa5e2LaBZmUgLQbR/DYW0uFsA5iMslq/ZECCxOoBmaE0Vkd2OhU1FEysjSiciGJiTChGAhan1L4cg96mNMtu6jk82lZOvCyH+R7B6ZybUrZiJXzEQo2VKQBiZkgAnBZCMJydzAqN/dzsjJnu8taM4JE0cHFRNDcdBFHT4CzrUybm2gCjihvWNUwDA/KvB/UQFhWAHhWAHaixKZu+sZW/lc9WiXnxtKQ+QLOlqH5wTlDN0YzKWZPJYJukdYPgrjsESG50FIiKehFWEx5VH5eBWflZlaudKNlnJpbpDUff9JURh191cpH6g7SnPPQ5Sfy9IdRVV8ZKKZjya9bpJev4/0oVSvPUQqGz6cbOYjk31YYtng4XQzH5muIfJ/3NjulvCDfeHh3vGoNF0XUDl5WHsSUrtVGf6Vj+E8G3fzLDYmVenuAWy2X32NfeZn09P82fA6NhEHMwlPgmr1f8LhrJbieoW3OkfN8NYrnvsNfv+dGmKrVogTZzRiFQcFajk/25papDmJi220Rg264eMs7e0aaXIcSWejoFSWqFeNLpXIksVwy0iktZlIxL1EzrUmnfmvE1lNiTyQa6MG5Z5S9YWgMvxfX9/ws5nBnz16bk+pesOkynD714bD7+GwxMMB9ZTd5BBxl4N2vngcP4JjgAy8CjtGbBmcN5D5q0CQQZ1g1uiMUWIUE6NSR80czRRCrmLM8IFDBg8cwRTid0K60SkYLRgiZozOZJ1kS7SC/GFg3uAtI3awq2iLqZZHIGV16hqxhok1GWsyVzOJEH+MyduxZcuOPCYR/wjSrc7EaMEQMXV1CvtWn8bvXiFScq3Jffem0G0g61wLubSRka3pG/FH2wjShnl2R7nL44+rvDGStZjP9+0DtU1ug6PnttygzfeP3hOp4hDWWsbRtvwbW84dZXKbQjMhSruOVkh7uubq7o1Xd+/BoiuxjEvB6HYs8x4sL1f9n2QE+bLyCfUE+bKK7pbRvOU75PRiGF1ejFXvaN48lGIJi7Dpag73aTrp9wea3/JJz0k/ipd/aDFcGUcA6Z4b4/SfcS+NV3FdrV9xf547BrRyaId0aYemsVyEjM4Cnex0nQV1VC2CLicxXp6H3FUGSd91fOQqHGYQcugkSMIgVHLdkVAeRQ6H2mE8chw5xjyZ4fqKz82cI+amMC0WXdKsmXOSaFeBXhPEpKlTJwk2SUxdIBZjqdwBvb0KgRkp08X0TKbHoueaNGtGFu0YmD8nK2sWMqAriALVaK7XV81Ary+bgWb+YNDdS/2Gw/A6OEDNdB2IxFmJC6eyhVOyk9Yksf3xJ5POpLMzaaey9uew1VnZWQsXsoULZpm3nd0jGjl5zPgJbMLEuISRiazL+GaJLekEYPP54cvYyPlxiydks/HZk1eJ3LsXtfURUebeta337V3z7GtT1VQtvuzY4d2nBTstDvdb1pH1m9R7ek/Beorec/uhqUrTimdEYd/sEJYUP2OceLvkSpRz4kivJcGsR4NmwfZBbMK7UQU9V7D1q5ZtETtL36EyYNng9WNYz7FRERO6M/u2Zqd6fMqWnDryjsHFvHRl5YzlSTksu6hwzxk6oPCvhc5Uu/m9/VoPItBeLtVB+fHZSbOnzUlih30/a/1DJFucvCh58Uy2d9L+ae8K9q7YP2/vYrZ41qLZi2ezH7Z/dvbwNTYna/a82Vls54errhqryY90luyr/He2YK5MWZsbed1RktfhYmTi2/Fs/K6hmyNy/mU5RMQPHTq+P3s7Z+T84ffiBhpxA+OjY8ZHsrj3J50UZ8i/I1ePPDnD6/P4d20mtYvrzMZvj944MIfN/Zl7cv3IEvn7LxdyzdG+cI1GzVIHdGMGqg7+lf32Gwl0PeXhuK0RbNPg5T1FV6ZHqzrcjK+Nfd64b824m63kFrY65uVT+hfgnkP+yRdGODSUCz0aXC8SKBrcL5rTfuuKy/FVq2HMKhg9hnbHyuqqOsf3XZi7orsinxeDXhDMnUM7ZlV1WZ3je8Z0SEmCTdOgtwrlMfNgUlc4tAimbQTXq65d3NjSuu8dUK/I6tC7N+jh7lheErgX+R3XsrWl0Psd0LP1bLr9iMJ0/daT0HufqQz39QI5ZBVXT9J3b9JzTxhxGOb6Un0pIWhLtWwDWP07TlkA0vHV5SvQuxddPZfA+6hQODkR9slQCF4KM9R4LkP3wcSToEL7wFJjokd+rz3Jq1UjM8PQpfmTt0/fjmVbQUjLmSM32fCD/XZ3xQHKKq00eKryqjwMXjxgXgTdF9pmdPhAFjVy2ODRA9nG8H39Do9gG9bz3isHbo4tYAcufnngJu2RzUteN41FRMDkeRNnTzTantH/JsxKyJrMunaFXRP5mum5M9fRZS0752/LYXtX7tict5PF7Ri0qd9KFhYOc6dkTqLTDmbjxc/MKXPZQPMax9vaMR6pbDUaKy/zCEfFe0c4KnqOcHiJW422KyuqLRgga6rKt5UP4nYWqp6qJ1RnOpUg66k3ZWfE9RGy8u87ZS3WFj2Az1Qstk5v9TSaYnQCxUvUuBwprRS3U9WUlasjOkMyWU/WExIZyc4KP5E1o8MKlasPUDUp1e3SeusyinHvtIo5et90reJGsWsr9BWgrdRWmFNW7kru58D9nOs5z0JkABpEqrbw8WHhXaBjx3G+y99iH5yDjK1L8nPXscOH4NixH8WxjuxYR/Faxw4M3ejY2CEJg1NZy1ZweewXy48dJ6Svv8be4/M1cxe5i/jXPth/vv6aHToMx48t/2LsZdaqJaQOThgSG0v0HTq+ltbxOOt4TPx47BghrcvNX7I1g537AN5a7juuY0dC8sbirn3Dh2k3tb28y2FQn6DHdSgc5CfogdGGCa1rcTOu0xHImBhaQ9Te1OvBqVOgV9AqgEY/wTgmP4N6g3AQAdF0wgk+ZUYbiKdOGrtiCzltqdWeNzcsX7t/w/I1Y7+R/ryxYVkbJpfxcctAvSxfhh074EZ9ujOZVsHoQIiMEuywwSJcAFk9RhtojW3gWbjxDWwfiHTqZRg/3rNAYCyAl+wdDrtvK3HY3Z3PhWYkBb1cP0mr612evRQkbYjfHA01a4KMx7Y0Wsi2qq1QoxkNEfipRmMrwaGiLV3eNYbtI2Y9pVM5JY6psoeQTukUsic2qh4Ic6oeiI6MfqtF12Ua2+0nZIP8SIXxXkSaBDIJ36hgOpM8nf8vT22gB/rBf+XUhva8pv93OX7vSuKyr+xHJzyM/dbjxsHyccbOAZq8URSl3VIHuOyn+oGinx2R5h7s5cuNaR76HBgJeiPVghs3NWJNlzE3Mo/yHPEJM9dejJM+vOS0z2OejdJayr9FIkYPQrxcbbR8F2mbLqA/SxXYBcTta9duC3ZbXPMV1ZkeobpwAyxfleVlBbS/Gdng5emE66t0LAo+pk6QD27jQsF8Cmr5TbhOFxroHL8JzP+ly9OyE2Tec3lS0OVpabo8IwYO/v+Fy/M/2E/UlRauBF1UqASiC/ykTX90CLH8PmX9uCHbfPPKJ79sZn02DT8kipj45bPPfxXsV/FZgEDTImR4lz7R7JehVxptrsM+vrJPWrHMmR4m23Nj1rlFyazzR54Z6Q9DjzYn5ue4elEoqB+jKrJLHX6KMqryp62XjrMYdEvhG4w1BoEqMN9ViVcppuV/vVnJBTfF79+74EZD6HkPxocgPjl58h6CcS9OCzg/hIs/6GbQ139QTwp2ByPx/frrQj3JaK8bvn94HU0igwzfP/yAuMh5EOnpd667Yvj4ZTBhAiyJhxWou9rKlnzqakhOg5SZNI0v7R9wsRZmCEhOhQWjUTkLPh/jMyAZZYoD6dOS5yyDlFmQnA6JaFG1US35iomwJIeUFCpTfZW7Ch83AZaPghVrYGw26LNdT3BMp5Vx8UJbbFM0891MNuXS5wMYi2rMpyWsQCuozhmOqYE4iIOBsUig2TIRByMJB1ERp247ZKVaGfPgKDpdeuBumsxlRzusQqyOX8IYtKF61efyA4OT+sDgJD9FTh2/grfRbgp1wCrUcL9tQ4NNRcHuEWiwySjolwfVVF+uxkkvGNUH5DjlBWv2gtaIdkxUJ8Q8MveioD8SBKG5IMcS5l5QYxFzdR+YcoDTRhKS+0cjbfdjA7k8qK+CvWtBHdRWQR8svp91NASMAAEpMg60ca4GnMoNdg4FbZWrKgzYBHe2RXNttbsq7NwM+mpXFRgQbV5XqB2k28hQf40fB8vGgzqiOblYB7GYZiyso6n7IH4vsA6Kg7BblAQoojiI3wvEwh0f9wSOTvBRQ5EeVUdoaJTL5VFMXl8DO7aDvkZbA5GR4Gquz8ahOcgYHe8E0XAYi974nSBDvxUHmTvPgu4kmNsWC81ti+YJEY+G9OhL969IR5vKCo0NT+ZxkChOm5vuHU5xectMurD1oriByqHZRVNVGNe3el9sSre0FvIQ0XM/XU5WtH9/EbkS5qVkHXr07EAbYL7WNmqfcOd1Iatdv86uXZPVxXVfJpuopoCaVlX39WVOp6omnNfZIGxQ3qo+qJlqJsTHx4r4HBZSBLV/ge++g19q04Ez42oNDJlXctSX3oBE38lYPnSoCNs8hPg2gfyhhWLzZpafLwqHbGaqiWwCQ/PDxBDPHeniP1p7Eye4se/77m5w2U12l8nC3CNu7gbHP9VddaM94sLVwjjMrk6ZVxV7buOiTUPaWek6z6mGguC8cVw4yPUzR5+KFEc5RhHSLp/Fx47c7UI+Q//Mip0Jn4gGwd3YjGTo0HdgcxFoYP6y78aFo2zObDi4fXOROI+ClTOVEfp5R135fOwKGDsWVuD/K9Aj05/mtHXdjg8dEwnFriVkCM0hjWehqLxuy9ucMmj8Yw7d2FESZZwKkSFqnIEujnJFJhMS0usoqLPdOfbAILpwS5Hbii5HARas8UkgioqgxSnjjo/cXJrCHzmSJut1Wp0yFqLQqDUWog4fBo1Wp4wlq/DD5pLVIWN1yrXflcUNx5aOGrVC7gVrzPujPQeSSo4p9YdR6ALq+iZuOMQ70LJshVQRo4w1Dc+5JTpNZJxt6g9r9hns25IVkE6edxBZJv+GZi9aC/pAnpZmZjByh+l9PyxSuClSXG/w+v8AbTI05wAAeNpjfsHAwIyG2TgxxaiCs7GIKTAwsN6hkX0wvBaIK1HtxIrRw+EaAwNLKgMDUwSqOMsGoJg7pnoWayAuB/pHBsoG4UcQDPZ7NiIMuHfQ2M/oeCnUHTC3ngf6oRDI1oVgEJ/NAcgWArJ/oupl/IKkT5+wXYzHGRg4ZmAPU2wYFMYYYp8xxVhNIZjpHQSD4+gkAwP7bCA/nYAd1uTRYHuh6ZMJaA/zVChGkmP6i+ZOqHqUcIxEVcO0BVU9y26onkCovDXEXGR/AQCVfrif)
    format("woff");
}

#distributorButton {
  height: 24px;
  min-width: 24px;
  font-size: 24px;
  min-width: 24px;
  box-sizing: border-box;
  color: #444;
  line-height: 26px;
  border-radius: 3px;
  background: none;
}

#distributorButton:disabled {
  color: #d4d4d4;
}

#distributorButton:hover,
#distributorButton:active {
  background-color: #efefef;
}

#distributorButton:disabled:hover {
  background: none;
}

#distributor {
  user-select: none;
}

.v--modal-overlay {
  width: 1px;
  height: 1px;
}

.v--modal-box {
  box-shadow: 0 0 0.5px 0.5px rgba(0, 0, 0, 0.2), 0 2px 14px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  background: #f8f8f8;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: all 0s !important;
}

#header {
  height: 36px;
  width: 100%;
  background: #2c2c2c;
  color: #fff;
  position: relative;
}

#title {
  font-size: 12px;
  letter-spacing: 0.2px;
  -webkit-font-smoothing: antialiased;
  line-height: 36px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 12px;
  margin-right: 36px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: calc(100% - 60px);
}

#closeButton {
  font-family: "FigmaIcons";
  -webkit-font-smoothing: antialiased;
  height: 36px;
  width: 36px;
  font-size: 10px;
  position: absolute;
  right: 0;
  opacity: 0.3;
}

#closeButton::after {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  content: "\101";
}

#closeButton:hover {
  opacity: 1;
}

#distributorBody {
  padding: 12px;
  position: relative;
  display: flex;
  border-bottom: 1px solid #efefef;
}

.label {
  font-size: 11px;
  color: #aaa;
  margin-bottom: 6px;
}

#directionPicker {
  display: flex;
  border-radius: 3px;
  margin-right: 8px;
  overflow: hidden;
  width: 140px;
}

.directionButton {
  height: 24px;
  width: 70px;
  position: relative;
  color: #fff;
  background: #d4d4d4;
  line-height: 25px;
  text-align: center;
}

.buttonActive {
  background-color: #30c2ff !important;
}

.distributorInput {
  cursor: default;
  border: 1px solid #d4d4d4;
  border-radius: 3px;
  background: #fcfcfc;
  height: 24px;
  padding: 0 2px 0 4px;
  box-sizing: border-box;
  width: 100%;
  margin-right: 6px;
}

.distributorInput::-webkit-input-placeholder {
  color: #d4d4d4;
}

.distributorInput:focus {
  border-color: #30c2ff;
  box-shadow: inset 0 0 0 1px #30c2ff;
}

#distributorFooter {
  display: flex;
  padding: 12px;
}

#distributeButton {
  height: 30px;
  line-height: 30px;
  max-width: 180px;
  padding: 0 11px;
  color: #444;
  font-weight: 400;
  background-color: transparent;
  box-sizing: border-box;
  border: 1px solid #d4d4d4;
  border-radius: 3px;
  margin-left: auto;
}
#distributeButton:disabled {
  color: #d4d4d4;
}
</style>
