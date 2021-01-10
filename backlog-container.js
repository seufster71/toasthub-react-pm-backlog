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
import BaseContainer from '../../core/container/base-container';


class PMBacklogContainer extends BaseContainer {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		if (this.props.history.location.state != null && this.props.history.location.state.parent != null) {
			this.props.actions.init({parent:this.props.history.location.state.parent,parentType:this.props.history.location.state.parentType});
		} else {
			this.props.actions.init({});
		}
	}

	getState = () => {
		return this.props.pmbacklog;
	}
	
	getForm = () => {
		return "PM_BACKLOG_FORM";
	}
	
	
	onOption = (code, item) => {
		fuLogger.log({level:'TRACE',loc:'ProductContainer::onOption',msg:" code "+code});
		if (this.onOptionBase(code,item)) {
			return;
		}
		
		switch(code) {
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

	render() {
		fuLogger.log({level:'TRACE',loc:'BacklogContainer::render',msg:"Hi there"});
		if (this.props.pmbacklog.isModifyOpen) {
			return (
				<BacklogModifyView
				itemState={this.props.pmbacklog}
				appPrefs={this.props.appPrefs}
				onSave={this.onSave}
				onCancel={this.onCancel}
				inputChange={this.inputChange}
				/>
			);
		} else if (this.props.pmbacklog.items != null) {
			return (
				<BacklogView
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
