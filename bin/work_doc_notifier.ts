#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WorkDocNotifierStack } from '../lib/work_doc_notifier-stack';

const app = new cdk.App();
new WorkDocNotifierStack(app, 'WorkDocNotifierStack');
