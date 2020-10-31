import React from 'react';
import { PlatformStateContext, NerdGraphQuery, Spinner, HeadingText, Grid, GridItem, Stack, StackItem, Select, SelectItem, AreaChart, TableChart, PieChart, Dropdown  } from 'nr1'
import { timeRangeToNrql } from '@newrelic/nr1-community';
// import Select from "react-dropdown-select";
// import Select from 'react-select';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction
export default class UseNerdgraphNerdletNerdlet extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            accountId: 2379999,
            accounts: null,
            selectedAccount: null,
        }
    }
    componentDidMount() {
        const accountId = this.state;
        const gql = `{ actor { accounts { id name } } }`;
        const accounts =  NerdGraphQuery.query({ query: gql })
        accounts.then(results => {
            console.log('Nerdgraph Response:', results);
            const accounts = results.data.actor.accounts.map(account => {
                return account;
            });
            const account = accounts.length > 0 && accounts[0];
            this.setState({ selectedAccount: account, accounts });
        }).catch((error) => { console.log('Nerdgraph Error:', error); })
    }
    selectAccount(option) {
        this.setState({ accountId: option.id, selectedAccount: option });
    }
    render() {
        const { accountId, accounts, selectedAccount  } = this.state;
        console.log({ accountId, accounts, selectedAccount });
        const query = `
            query($id: Int!) {
                actor {
                    account(id: $id) {
                        name
                    }
                }
            }
        `;
        const variables = {
          id: accountId,
        };
        const avgResTime = `SELECT latest(daysLeft), latest(expirationDate) FROM ssl_certificate_check FACET certCommonName, targetURL, label.customer_name LIMIT MAX `;
        const trxOverview = `SELECT latest(diskUsedPercent) as Diskusagepercent, latest(diskFreeBytes)/1073741274 as freespaceGB, latest(diskUsedBytes)/1073741274 as usedspaceGB  FROM SystemSample FACET hostname, label.customer_name LIMIT MAX  `;
        const errCount = `SELECT  latest(expired_date), latest(days_remaining)/86400 as Days_Remaining  FROM FlexlmLicenseExpirySample FACET service_name, label.customer_name LIMIT MAX `;
        const responseCodes = `SELECT latest(uptimeSeconds)/86400 as UptimeinHRS FROM UptimeSample FACET hostname, label.customer_name LIMIT MAX `;
        return (
            <Stack
                fullWidth
                horizontalType={Stack.HORIZONTAL_TYPE.FILL}
                gapType={Stack.GAP_TYPE.EXTRA_LOOSE}
                spacingType={[Stack.SPACING_TYPE.MEDIUM]}
                directionType={Stack.DIRECTION_TYPE.VERTICAL}>
                <StackItem>
                    <NerdGraphQuery query={query} variables={variables}>
                        {({loading, error, data}) => {
                            if (loading) {
                                return <Spinner />;
                            }
                            if (error) {
                                return 'Error!';
                            }
                            return <HeadingText>{data.actor.account.name} Account:</HeadingText>;
                        }}
                    </NerdGraphQuery>
                </StackItem>
                {accounts &&
                    <StackItem>
                        <Select value={selectedAccount} onChange={(evt, value) => this.selectAccount(value)}>
                        {accounts.map(a => {
                            return (
                              <SelectItem key={a.id} value={a}>
                                {a.name}
                              </SelectItem>
                            )
                        })}
                        </Select>
                    </StackItem>

                }
				
                <StackItem>
                <hr />
                    <PlatformStateContext.Consumer>
                    {(PlatformState) => {
                        /* Taking a peek at the PlatformState */
                        const since = timeRangeToNrql(PlatformState);
                        return (
                        <>
                            <Grid
                            className="primary-grid"
                            spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
                            >
                                <GridItem className="primary-content-container" columnSpan={6}>
                                    <main className="primary-content full-height">
                                    <HeadingText spacingType={[HeadingText.SPACING_TYPE.MEDIUM]} type={HeadingText.TYPE.HEADING_4}>
                                        DISK UTILIZATION
                                    </HeadingText>
                                    <TableChart fullWidth accountId={accountId} query={trxOverview+since} />
                                    </main>
                                </GridItem>
                                <GridItem className="primary-content-container" columnSpan={6}>
                                    <main className="primary-content full-height">
                                    <HeadingText spacingType={[HeadingText.SPACING_TYPE.MEDIUM]} type={HeadingText.TYPE.HEADING_4}>
                                        SSL Certificate Info
                                    </HeadingText>
                                    <TableChart fullWidth accountId={accountId} query={avgResTime+since} />
                                    </main>
                                </GridItem>
                                <GridItem className="primary-content-container" columnSpan={6}>
                                    <main className="primary-content full-height">
                                    <HeadingText spacingType={[HeadingText.SPACING_TYPE.MEDIUM]} type={HeadingText.TYPE.HEADING_4}>
                                        System Uptime
                                    </HeadingText>
                                    <TableChart fullWidth accountId={accountId} query={responseCodes+since} />
                                    </main>
                                </GridItem>
                                <GridItem className="primary-content-container" columnSpan={6}>
                                    <main className="primary-content full-height">
                                    <HeadingText spacingType={[HeadingText.SPACING_TYPE.MEDIUM]} type={HeadingText.TYPE.HEADING_4}>
                                        FlexLM License Expiry
                                    </HeadingText>
                                    <TableChart fullWidth accountId={accountId} query={errCount+since} />
                                    </main>
                                </GridItem>
                            </Grid>
                        </>
                        );
                    }}
                    </PlatformStateContext.Consumer>
                </StackItem>
            </Stack>
        )
    }
}