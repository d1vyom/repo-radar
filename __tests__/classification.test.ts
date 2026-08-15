import { classifyRepository } from '../lib/classification/engine';

describe('Deterministic Domain Classifier', () => {
  it('should correctly classify a Web3/Blockchain repository', () => {
    const description = 'A decentralized smart contract protocol for Ethereum.';
    const topics = ['web3', 'solidity', 'crypto'];
    const language = 'Solidity';

    const results = classifyRepository(description, topics, language);
    
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ domainSlug: 'blockchain' })
      ])
    );
    expect(results.find(r => r.domainSlug === 'blockchain')?.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it('should correctly classify an IoT hardware repository', () => {
    const description = 'Firmware for Arduino based smart home sensors.';
    const topics = ['arduino', 'sensors', 'home-automation'];
    const language = 'C++';

    const results = classifyRepository(description, topics, language);
    
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ domainSlug: 'iot' })
      ])
    );
  });

  it('should allow multiple domains for a single repository', () => {
    const description = 'Machine learning models deployed on a Next.js web application.';
    const topics = ['machine-learning', 'react', 'nextjs'];
    const language = 'TypeScript';

    const results = classifyRepository(description, topics, language);
    
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ domainSlug: 'machine-learning' }),
        expect.objectContaining({ domainSlug: 'web-development' })
      ])
    );
  });
});
