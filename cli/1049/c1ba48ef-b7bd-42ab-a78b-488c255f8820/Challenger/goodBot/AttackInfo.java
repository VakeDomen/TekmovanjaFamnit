import java.util.ArrayList;

public class AttackInfo {
    int arrivalTurn;
    int fleetSize;
    Planet attackTarget;
    ArrayList<Planet> planets;

    public AttackInfo(int arrivalTurn, int fleetSize, Planet attackTarget, ArrayList<Planet> planets) {
        this.arrivalTurn = arrivalTurn;
        this.fleetSize = fleetSize;
        this.attackTarget = attackTarget;
        this.planets = planets;
    }

    public AttackInfo() {
        this.arrivalTurn = -1;
    }

    public float attackMetric(int currentTurn) {
        if (this.arrivalTurn == -1) {
            return Integer.MAX_VALUE;
        }
        // float frontierMetric = attackTarget.frontierMetric(planets);
        return attackTarget.size - (float)(arrivalTurn - currentTurn) / 70;
    }
    
    public String createAttackMove() {
        String res = "";
        for (Planet planet : this.planets) {
            planet.deactivate();
            res += Utility.createAttack(planet, attackTarget);
        }

        return res;
    }
}