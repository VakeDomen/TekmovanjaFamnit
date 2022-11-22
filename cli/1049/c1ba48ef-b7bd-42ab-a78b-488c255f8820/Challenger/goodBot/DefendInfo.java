public class DefendInfo {
    int inDangerTurn;
    int fleetSizeToDefend;
    Planet defendTarget;

    public DefendInfo(int inDangerTurn, int fleetSizeToDefend, Planet defendTarget) {
        this.inDangerTurn = inDangerTurn;
        this.fleetSizeToDefend = fleetSizeToDefend;
        this.defendTarget = defendTarget;
    }

    public DefendInfo() {
        this.inDangerTurn = -1;
    }

    public float defendMetric() {
        if (this.inDangerTurn == -1) {
            return Integer.MAX_VALUE;
        }
        
        return defendTarget.size;
    }
}