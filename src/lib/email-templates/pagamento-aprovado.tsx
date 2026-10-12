import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  nome?: string
  pedidoId?: string
  total?: string
}

const Email = ({ nome, pedidoId, total }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Pagamento aprovado — Look China</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>Look China</Heading>
        </Section>
        <Heading style={title}>Pagamento aprovado!</Heading>
        <Text style={text}>{nome ? `Olá, ${nome}!` : 'Olá!'}</Text>
        <Text style={text}>
          Temos uma ótima notícia: o pagamento do seu pedido{pedidoId ? ` ${pedidoId}` : ''} foi
          <b> aprovado</b>{total ? ` no valor de ${total}` : ''}.
        </Text>
        <Text style={text}>
          Seu pedido já está em preparação e em breve você receberá novas atualizações sobre a entrega.
        </Text>
        <Section style={ctaBox}>
          <Button style={cta} href="https://lookchinavariedades.store">
            Acompanhar meu pedido
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Look China
          <br />
          Este é um e-mail automático referente ao seu pedido. Em caso de dúvidas, responda esta mensagem.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Pagamento aprovado — Look China',
  displayName: 'Pagamento aprovado',
  previewData: { nome: 'Maria', pedidoId: '#1234', total: 'R$ 129,90' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '20px 25px' }
const header = { backgroundColor: '#FF5814', borderRadius: '8px', padding: '16px', textAlign: 'center' as const }
const logo = { color: '#ffffff', fontSize: '24px', fontWeight: 800, margin: 0 }
const title = { color: '#111111', fontSize: '22px', marginTop: '24px' }
const text = { color: '#333333', fontSize: '15px', lineHeight: '24px' }
const ctaBox = { textAlign: 'center' as const, margin: '24px 0' }
const cta = { backgroundColor: '#FF5814', color: '#ffffff', fontWeight: 700, padding: '12px 28px', borderRadius: '8px', textDecoration: 'none' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const footer = { color: '#888888', fontSize: '12px', lineHeight: '18px' }
