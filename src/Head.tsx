/// <reference types="vite-plugin-svgr/client" />
import { Typography, Flex } from 'antd';
import Logo from './assets/rp.svg?react';
const { Text } = Typography;

const Head = () => {
  return (<>
  <Flex vertical align="center">
    <Logo width="256px"/>
    <Text italic>The ITG events leaderboard for all</Text>
  </Flex>
</>)}

export default Head;