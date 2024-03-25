import React from 'react'
import ReactDOM from 'react-dom/client'
import Head from './Head.tsx'
import App from './App.tsx'
import './index.css'
import { Layout, ConfigProvider, theme, Typography, Flex } from 'antd';
const { Header, Content, Footer } = Layout;
const { Text } = Typography;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <ConfigProvider theme={{ 
    algorithm: theme.darkAlgorithm, 
    token: { colorPrimary: "#ee0890" },
    components: { Layout: {
      headerBg: "#141414",
      headerHeight: 92,
      headerPadding: "24px",
      footerBg: "#141414",
      footerPadding: "24px"
    }}
  }}>
    <Layout >
      <Header style={{borderBottom: "1px solid #313131"}}>
        <Head/>
      </Header>
      <Content>
        <App/>
      </Content>
      <Footer>
        <Flex vertical align="center">
          <Text>Data provided by the <a style={{fontWeight: 'bold'}} className="external" href="https://itc.dance/" target="_blank" rel="noopener">International Timing Collective</a></Text>
          <Text>Website maintained and developed by <a style={{fontWeight: 'bold'}} className="external" href="https://cering.dev/" target="_blank" rel="noopener">CERiNG</a></Text>
        </Flex>
      </Footer>
    </Layout>
  </ConfigProvider>
  </React.StrictMode>,
)
