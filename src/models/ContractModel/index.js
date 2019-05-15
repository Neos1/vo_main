import {observable, action } from 'mobx';

class ContractModel {

  @observable contract;
  
  @action setContract = (contract)=>{
    this.contract = contract;
    console.info(contract)
  }

}

const contractModel = new ContractModel();

export default contractModel;