/*
 * Copyright (C) 2020 The ToastHub Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use-strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as backlogActions from './backlog-actions';
import fuLogger from '../../core/common/fu-logger';
import BacklogView from '../../memberView/pm_backlog/backlog-view';
import BacklogModifyView from '../../memberView/pm_backlog/backlog-modify-view';
import utils from '../../core/common/utils';
import moment from 'moment';


class PMBacklogContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {pageName:"PM_BACKLOG",isDeleteModalOpen: false, errors:null, warns:null, successes:null};
	}

	componentDidMount() {
		if (this.props.history.location.state != null && this.props.history.location.state.parent != null) {
			this.props.actions.init({parent:this.props.history.location.state.parent,parentType:this.props.history.location.state.parentType});
		} else {
			this.props.actions.init({});
		}
	}

	onListLimitChange = (fieldName, event) => {
		let value = 20;
		if (this.props.codeType === 'NATIVE') {
			value = event.nativeEvent.text;
		} else {
			value = event.target.value;
		}

		let listLimit = parseInt(value);
		this.props.actions.listLimit({state:this.props.pmbacklog,listLimit});
	}

	onPaginationClick = (value) => {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::onPaginationClick',msg:"fieldName "+ value});
		let listStart = this.props.pmbacklog.listStart;
		let segmentValue = 1;
		let oldValue = 1;
		if (this.state["PM_BACKLOG_PAGINATION"] != null && this.state["PM_BACKLOG_PAGINATION"] != ""){
			oldValue = this.state["PM_BACKLOG_PAGINATION"];
		}
		if (value === "prev") {
			segmentValue = oldValue - 1;
		} else if (value === "next") {
			segmentValue = oldValue + 1;
		} else {
			segmentValue = value;
		}
		listStart = ((segmentValue - 1) * this.props.pmbacklog.listLimit);
		this.setState({"PM_BACKLOG_PAGINATION":segmentValue});
		
		this.props.actions.list({state:this.props.pmbacklog,listStart});
	}

	onSearchChange = (fieldName, event) => {
		if (event.type === 'keypress') {
			if (event.key === 'Enter') {
				this.onSearchClick(fieldName,event);
			}
		} else {
			if (this.props.codeType === 'NATIVE') {
				this.setState({[fieldName]:event.nativeEvent.text});
			} else {
				this.setState({[fieldName]:event.target.value});
			}
		}
	}

	onSearchClick = (fieldName, event) => {
		let searchCriteria = [];
		if (fieldName === 'PM_BACKLOG-SEARCHBY') {
			if (event != null) {
				for (let o = 0; o < event.length; o++) {
					let option = {};
					option.searchValue = this.state['PM_BACKLOG-SEARCH'];
					option.searchColumn = event[o].value;
					searchCriteria.push(option);
				}
			}
		} else {
			for (let i = 0; i < this.props.pmbacklog.searchCriteria.length; i++) {
				let option = {};
				option.searchValue = this.state['PM_BACKLOG-SEARCH'];
				option.searchColumn = this.props.pmbacklog.searchCriteria[i].searchColumn;
				searchCriteria.push(option);
			}
		}

		this.props.actions.search({state:this.props.pmbacklog,searchCriteria});
	}

	onOrderBy = (selectedOption, event) => {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::onOrderBy',msg:"id " + selectedOption});
		let orderCriteria = [];
		if (event != null) {
			for (let o = 0; o < event.length; o++) {
				let option = {};
				if (event[o].label.includes("ASC")) {
					option.orderColumn = event[o].value;
					option.orderDir = "ASC";
				} else if (event[o].label.includes("DESC")){
					option.orderColumn = event[o].value;
					option.orderDir = "DESC";
				} else {
					option.orderColumn = event[o].value;
				}
				orderCriteria.push(option);
			}
		} else {
			let option = {orderColumn:"PM_BACKLOG_TABLE_NAME",orderDir:"ASC"};
			orderCriteria.push(option);
		}
		this.props.actions.orderBy({state:this.props.pmbacklog,orderCriteria});
	}
	
	onSave = () => {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::onSave',msg:"test"});
		let errors = utils.validateFormFields(this.props.pmbacklog.prefForms.PM_BACKLOG_FORM,this.props.pmbacklog.inputFields);
		
		if (errors.isValid){
			this.props.actions.saveItem({state:this.props.pmbacklog});
		} else {
			this.setState({errors:errors.errorMap});
		}
	}
	
	onModify = (item) => {
		let id = null;
		if (item != null && item.id != null) {
			id = item.id;
		}
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::onModify',msg:"test"+id});
		this.props.actions.modifyItem({id,appPrefs:this.props.appPrefs});
	}
	
	onDelete = (item) => {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::onDelete',msg:"test"});
		this.setState({isDeleteModalOpen:false});
		if (item != null && item.id != "") {
			this.props.actions.deleteItem({state:this.props.pmbacklog,id:item.id});
		}
	}
	
	openDeleteModal = (item) => {
		this.setState({isDeleteModalOpen:true,selected:item});
	}
	
	onOption = (code, item) => {
		fuLogger.log({level:'TRACE',loc:'ProductContainer::onOption',msg:" code "+code});
		switch(code) {
			case 'MODIFY': {
				this.onModify(item);
				break;
			}
			case 'DELETE': {
				this.openDeleteModal(item);
				break;
			}
			case 'DELETEFINAL': {
				this.onDelete(item);
				break;
			}
			case 'DEFECT': {
				this.props.history.push({pathname:'/pm-defect',state:{parent:item,parentType:"BACKLOG"}});
				break;
			}
			case 'ENHANCEMENT': {
				this.props.history.push({pathname:'/pm-enhancement',state:{parent:item,parentType:"BACKLOG"}});
				break;
			}
			case 'SHARE': {
				this.props.history.push({pathname:'/pm-team',state:{parent:item,parentType:"BACKLOG"}});
				break;
			}
			case 'SCRUM': {
				this.props.history.push({pathname:'/pm-scrum',state:{parent:item,parentType:"BACKLOG"}});
				break;
			}
		}
	}
	
	closeModal = () => {
		this.setState({isDeleteModalOpen:false,errors:null,warns:null});
	}
	
	onCancel = () => {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::onCancel',msg:"test"});
		this.props.actions.list({state:this.props.pmbacklog});
	}
	
	inputChange = (type,field,value,event) => {
		utils.inputChange({type,props:this.props,field,value,event});
	}
	
	onBlur = (field) => {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::onBlur',msg:field.name});
		let fieldName = field.name;
		// get field and check what to do
		if (field.optionalParams != ""){
			let optionalParams = JSON.parse(field.optionalParams);
			if (optionalParams.onBlur != null) {
				if (optionalParams.onBlur.validation != null && optionalParams.onBlur.validation == "matchField") {
					if (field.validation != "") {
						let validation = JSON.parse(field.validation);
						if (validation[optionalParams.onBlur.validation] != null && validation[optionalParams.onBlur.validation].id != null){
							if (this.props.pmbacklog.inputFields[validation[optionalParams.onBlur.validation].id] == this.props.pmbacklog.inputFields[fieldName]) {
								if (validation[optionalParams.onBlur.validation].successMsg != null) {
									let successMap = this.state.successes;
									if (successMap == null){
										successMap = {};
									}
									successMap[fieldName] = validation[optionalParams.onBlur.validation].successMsg;
									this.setState({successes:successMap, errors:null});
								}
							} else {
								if (validation[optionalParams.onBlur.validation].failMsg != null) {
									let errorMap = this.state.errors;
									if (errorMap == null){
										errorMap = {};
									}
									errorMap[fieldName] = validation[optionalParams.onBlur.validation].failMsg;
									this.setState({errors:errorMap, successes:null});
								}
							}
						}
					}
				} else if (optionalParams.onBlur.func != null) {
					
				}
			}
		}
	}
	
	goBack = () => {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::goBack',msg:"test"});
		this.props.history.goBack();
	}

	render() {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::render',msg:"Hi there"});
		if (this.props.pmbacklog.isModifyOpen) {
			return (
				<BacklogModifyView
				containerState={this.state}
				item={this.props.pmbacklog.selected}
				inputFields={this.props.pmbacklog.inputFields}
				appPrefs={this.props.appPrefs}
				itemPrefForms={this.props.pmbacklog.prefForms}
				onSave={this.onSave}
				onCancel={this.onCancel}
				onReturn={this.onCancel}
				inputChange={this.inputChange}
				onBlur={this.onBlur}/>
			);
		} else if (this.props.pmbacklog.items != null) {
			return (
				<BacklogView
				containerState={this.state}
				itemState={this.props.pmbacklog}
				appPrefs={this.props.appPrefs}
				onListLimitChange={this.onListLimitChange}
				onSearchChange={this.onSearchChange}
				onSearchClick={this.onSearchClick}
				onPaginationClick={this.onPaginationClick}
				onOrderBy={this.onOrderBy}
				closeModal={this.closeModal}
				onOption={this.onOption}
				inputChange={this.inputChange}
				goBack={this.goBack}
				session={this.props.session}
				/>
			);
		} else {
			return (<div> Loading... </div>);
		}
	}
}

PMBacklogContainer.propTypes = {
	appPrefs: PropTypes.object,
	actions: PropTypes.object,
	pmbacklog: PropTypes.object,
	session: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {appPrefs:state.appPrefs, pmbacklog:state.pmbacklog, session:state.session};
}

function mapDispatchToProps(dispatch) {
  return { actions:bindActionCreators(backlogActions,dispatch) };
}

export default connect(mapStateToProps,mapDispatchToProps)(PMBacklogContainer);
