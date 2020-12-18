import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as WorkDocNotifier from '../lib/work_doc_notifier-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new WorkDocNotifier.WorkDocNotifierStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
