import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { Slide, ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import classNames from 'classnames'
import { isCompatible, register, unregister, getRegistration } from 'service-worker/registration'
import Observer from '@researchgate/react-intersection-observer'

import ToggleButton from './toggle-button'
import styles from './index.module.css'

import { MDBCard, MDBCardBody, MDBCardText } from 'mdbreact'

const scrollToComponent = typeof window !== 'undefined' && require('react-scroll-to-component')
const defaultScrollOptions = { offset: 0, align: 'bottom', duration: 600 }

const { createProxyClient } = require('service-worker-gateway/node_modules/ipfs-postmsg-proxy')

class GatewaySection extends Component {
  state = {
    isActive: false,
    inView: false,
    incompatible: false,
    inProgress: false,
    isMessageVisible: true,
    GatewaySvgAnimation: null
  }

  componentDidMount () {
    Promise.all([
      // Dynamic import to optimize both TTFP (Time To First Paint) and page load
      import(/* webpackChunkName: "gateway" */'./gateway-svg-animation').catch(console.error),
      getRegistration().catch(console.error)
    ]).then(([{ default: GatewaySvgAnimation } = {}, registration]) => {
      this.setState({
        isActive: Boolean(registration),
        GatewaySvgAnimation
      })

      document.querySelector('#serviceWorkerButton').click()
    })

    this.setState({ incompatible: !isCompatible() })
  }

  componentWillUnmount () {
    clearTimeout(this.scrollTimeout)
  }

  componentDidUpdate (prevProps, prevState) {
    if ((!prevState.isActive && this.state.isActive) && this.state.inView) {
      this.scrollTimeout = setTimeout(() => {
        scrollToComponent(this.sectionContainerRef, defaultScrollOptions)
      }, 2300)
    }
  }

  render () {
    const magicKey = window.location.search

    const { isActive, inView, incompatible, inProgress, isMessageVisible, GatewaySvgAnimation } = this.state
    const contentClasses = classNames(styles.content, {
      [styles.active]: isActive
    })

    return (
      <div className={ styles.container } ref={ this.handleContainerRef }>
        <div className={ contentClasses }>
          <h1>Magic</h1>
            <MDBCard>
              <MDBCardBody>
                <MDBCardText>This is where magic happens!</MDBCardText>
              </MDBCardBody>
            </MDBCard>
          <div className={ styles.gatewayContainer }>
            { GatewaySvgAnimation &&
              <Observer onChange={ this.handleObserverChange }>
                <GatewaySvgAnimation
                  isActive={ isActive }
                  inView={ inView }
                  isMessageVisible={ isMessageVisible }
                  onMessageCloseClick={ this.handleCloseClick }
                />
              </Observer>
            }
          </div>
          <ToggleButton
            id="serviceWorkerButton"
            isActive={ isActive }
            onClick={ this.handleToggleClick }
            className={ styles.toggle }
            incompatible={ incompatible }
            inProgress={ inProgress } />
          <ToastContainer
            className={ styles.toastContainer }
            transition={ Slide }
            pauseOnHover={ false } />
        </div>
      </div>
    )
  }

  handleCloseClick = () => {
    this.setState({ isMessageVisible: false })
  }

  handleContainerRef = (element) => {
    this.sectionContainerRef = element
  }

  handleToggleClick = () => {
    const { messages } = this.props.intl

    // Can't activate service-worker if serving from `/ipfs/xxx` or `/ipns/xxx` because
    // it must be served from the root
    if (/^\/(?:ipfs|ipns)\/[^/]+/.test(window.location.pathname)) {
      return toast.warning(messages.magic.nonRootScopeWarningMessage)
    }

    const { isActive } = this.state

    this.setState({ inProgress: true })

    if (isActive) {
      unregister()
        .then(() => {
          this.setState({ isActive: false, isMessageVisible: true })
        })
        .catch(() => toast.error(messages.magic.deactivationErrorMessage))
        .finally(() => this.setState({ inProgress: false }))
    } else {
      register()
        .then(() => {
          createProxyClient({
            addListener: navigator.serviceWorker.addEventListener.bind(navigator.serviceWorker),
            postMessage: (data) => navigator.serviceWorker.controller.postMessage(data)
          })

          this.setState({ isActive: true })

          // this.setState({ magicKey: window.location.search })
          // document.querySelector('#magic').disabled = false
        })
        .catch(() => toast.error(messages.magic.activationErrorMessage))
        .finally(() => this.setState({ inProgress: false }))
    }
  }

  handleObserverChange = ({ isIntersecting }) => this.setState({ inView: isIntersecting })

  handleMagicClick = () => {
    window.open('/magic/pov')
  }
}

export default injectIntl(GatewaySection)
