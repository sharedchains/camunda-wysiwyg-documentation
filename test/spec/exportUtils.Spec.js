import exportUtils from '../../client/react/ExportButton/exportUtils';

describe('Test element navigation from startEvent', () => {

  const utils = new exportUtils(undefined);

  it('should return an empty array', () => {
    let resultArray = utils.navigateFromStartEvent();
    expect(resultArray).to.be.an('array').that.is.empty;
  });

  it('should navigate on 2 elements', () => {
    let startEvent = {
      id: 'A',
      $type: 'bpmn:StartEvent',
      $instanceOf: (type) => {
        return type === 'bpmn:StartEvent';
      },
      outgoing: [
        {
          id: 'S1',
          $type: 'bpmn:SequenceFlow',
          $instanceOf: (type) => {
            return type === 'bpmn:SequenceFlow';
          },
          target: {
            id: 'B',
            $type: 'bpmn:EndEvent',
            $instanceOf: (type) => {
              return type === 'bpmn:EndEvent';
            },
            outgoing: []
          }
        }
      ]
    };

    let resultArray = utils.navigateFromStartEvent(startEvent);
    expect(resultArray).to.be.an('array').to.have.lengthOf(2);
  });

  it('should navigate on 3 elements \'in-a-row\'', () => {
    let startEvent = {
      id: 'A',
      $type: 'bpmn:StartEvent',
      $instanceOf: (type) => {
        return type === 'bpmn:StartEvent';
      },
      outgoing: [
        {
          id: 'S1',
          $type: 'bpmn:SequenceFlow',
          $instanceOf: (type) => {
            return type === 'bpmn:SequenceFlow';
          },
          target: {
            id: 'B',
            $type: 'bpmn:Task',
            $instanceOf: (type) => {
              return type === 'bpmn:Task';
            },
            outgoing: [
              {
                id: 'S2',
                type: 'bpmn:SequenceFlow',
                $instanceOf: (type) => {
                  return type === 'bpmn:SequenceFlow';
                },
                target: {
                  id: 'C',
                  type: 'bpmn:EndEvent',
                  $instanceOf: (type) => {
                    return type === 'bpmn:EndEvent';
                  },
                  outgoing: []
                }
              }
            ]
          }
        }
      ]
    };

    let resultArray = utils.navigateFromStartEvent(startEvent);
    expect(resultArray).to.be.an('array').to.have.lengthOf(3);
  });

  it('should navigate on two different branches and find 5 elements', () => {
    let startEvent = {
      id: 'A',
      $type: 'bpmn:StartEvent',
      $instanceOf: (type) => {
        return type === 'bpmn:StartEvent';
      },
      outgoing: [
        {
          id: 'S_Gateway',
          $type: 'bpmn:SequenceFlow',
          $instanceOf: (type) => {
            return type === 'bpmn:SequenceFlow';
          },
          target: {
            id: 'Gateway',
            $type: 'bpmn:Gateway',
            $instanceOf: (type) => {
              return type === 'bpmn:Gateway';
            },
            outgoing: [
              {
                id: 'S1',
                $type: 'bpmn:SequenceFlow',
                $instanceOf: (type) => {
                  return type === 'bpmn:SequenceFlow';
                },
                target: {
                  id: 'B',
                  $type: 'bpmn:Task',
                  $instanceOf: (type) => {
                    return type === 'bpmn:Task';
                  },
                  outgoing: [
                    {
                      id: 'S2',
                      type: 'bpmn:SequenceFlow',
                      $instanceOf: (type) => {
                        return type === 'bpmn:SequenceFlow';
                      },
                      target: {
                        id: 'C',
                        type: 'bpmn:EndEvent',
                        $instanceOf: (type) => {
                          return type === 'bpmn:EndEvent';
                        },
                        outgoing: []
                      }
                    }
                  ]
                }
              },
              {
                id: 'S3',
                $type: 'bpmn:SequenceFlow',
                $instanceOf: (type) => {
                  return type === 'bpmn:SequenceFlow';
                },
                target: {
                  id: 'D',
                  $type: 'bpmn:Task',
                  $instanceOf: (type) => {
                    return type === 'bpmn:Task';
                  },
                  outgoing: [
                    {
                      id: 'S4',
                      type: 'bpmn:SequenceFlow',
                      $instanceOf: (type) => {
                        return type === 'bpmn:SequenceFlow';
                      },
                      target: {
                        id: 'E',
                        type: 'bpmn:EndEvent',
                        $instanceOf: (type) => {
                          return type === 'bpmn:EndEvent';
                        },
                        outgoing: []
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    };

    let resultArray = utils.navigateFromStartEvent(startEvent);
    expect(resultArray).to.be.an('array').to.have.lengthOf(6);
  });
});